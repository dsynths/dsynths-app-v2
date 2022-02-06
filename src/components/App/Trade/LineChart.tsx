import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import useDefaultsFromURL from 'state/trade/hooks'
import { Sector } from 'state/details/reducer'
import { useAssetByContract } from 'hooks/useAssetList'
import { API_BASE_URL } from 'constants/api'
import { makeHttpRequest } from 'utils/http'
import { isPreMarket, isAfterHours } from 'utils/time'

import { LineChart as Chart } from 'components/Chart'
import { Card } from 'components/Card'
import useWeb3React from 'hooks/useWeb3'
import { Direction } from 'hooks/useTradePage'

const Wrapper = styled(Card)<{
  show: boolean
  border?: boolean
}>`
  padding: 0;
  height: ${({ show }) => (show ? '285px' : '0px')};
  border: ${({ theme, border, show }) => (show && border ? `1px solid ${theme.border2}` : 'none')};

  -webkit-transition: height 0.4s linear;
  -moz-transition: height 0.4s linear;
  -ms-transition: height 0.4s linear;
  -o-transition: height 0.4s linear;
  transition: height 0.4s linear;

  & > * {
    &:last-child {
      flex: 1;
    }
  }
`

const InfoWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.border2};
  padding: 10px 20px;
  align-items: flex-start;
  margin-bottom: 4px;

  & > * {
    display: flex;
    flex-flow: column nowrap;
    gap: 3px;

    &:last-child {
      align-items: flex-end;
    }
  }
`

const UpperText = styled.div`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.text1};
`

const BottomText = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text2};
`

const MarketSpan = styled.span<{
  positive: boolean
}>`
  color: ${({ positive, theme }) => (positive ? theme.green1 : theme.red1)};
`

type CandlestickResponse = {
  success: boolean
  data: Candlestick[]
  message: string
} | null

type QuoteResponse = {
  success: boolean
  data: Quote
  message: string
} | null

interface Candlestick {
  timestamp: number
  low: number
  high: number
  open: number
  close: number
  volume: number
}

interface Quote {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  current: number
  change: number
}

interface CandlesticksCache {
  [ticker: string]: Candlestick[]
}

interface QuoteCache {
  [ticker: string]: Quote | null
}

export default function LineChart() {
  const { chainId } = useWeb3React()
  const [cachedTicker, setCachedTicker] = useState('')
  const [cachedName, setCachedName] = useState('')

  const [candlesticks, setCandlesticks] = useState<Candlestick[]>([])
  const [candlesticksCache, setCandlesticksCache] = useState<CandlesticksCache>({})
  const [candlesticksLoading, setCandlesticksLoading] = useState(false)

  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteCache, setQuoteCache] = useState<QuoteCache>({})

  const [preMarket, setPreMarket] = useState(false)
  const [afterHours, setAfterHours] = useState(false)

  const { currencies } = useDefaultsFromURL()
  const asset = useAssetByContract(currencies.baseCurrency?.wrapped.address ?? undefined)

  const router = useRouter()
  const isSpiritTheme = useMemo(() => {
    return router.query?.theme === 'spirit'
  }, [router])

  const fetchCandlesticks = useCallback(
    async (ticker: string) => {
      try {
        const { href: url } = new URL(`/${asset?.sector}/ohlc?ticker=${ticker}&period=y&resolution=D`, API_BASE_URL)
        setCandlesticksLoading(true)
        const result: CandlestickResponse = await makeHttpRequest(url)
        setCandlesticksLoading(false)

        if (!result || !result.success) {
          throw new Error(`API returned an error: ${result?.message}`)
        }
        if (!Array.isArray(result.data)) {
          throw new Error('API data is not an array')
        }

        setCandlesticks(result.data)
        setCandlesticksCache((prev) => ({
          ...prev,
          [ticker]: result.data,
        }))
      } catch (err) {
        console.error(err)
        setCandlesticks([])
        setCandlesticksLoading(false)
      }
    },
    [asset]
  )

  const fetchQuote = useCallback(
    async (ticker: string) => {
      try {
        if (asset?.sector !== Sector.STOCKS) return null

        const { href: url } = new URL(`/stocks/quote?ticker=${ticker}`, API_BASE_URL)
        const result: QuoteResponse = await makeHttpRequest(url)

        if (!result || !result.success) {
          throw new Error(`API returned an error: ${result?.message}`)
        }

        setQuote(result.data)
        setQuoteCache((prev) => ({
          ...prev,
          [ticker]: result.data,
        }))
      } catch (err) {
        console.error(err)
        setQuote(null)
      }
    },
    [asset]
  )

  useEffect(() => {
    if (!asset) {
      setCandlesticks([])
      setQuote(null)
      return
    }

    setCachedTicker(asset.ticker)
    setCachedName(asset.name)

    if (candlesticksCache[asset.ticker]) {
      setCandlesticks(candlesticksCache[asset.ticker])
    } else {
      fetchCandlesticks(asset.ticker)
    }

    if (quoteCache[asset.ticker]) {
      setQuote(quoteCache[asset.ticker])
    } else {
      fetchQuote(asset.ticker)
    }
  }, [asset, chainId, candlesticksCache, quoteCache, fetchCandlesticks, fetchQuote])

  const content = useMemo(() => {
    return asset ? '' : 'Select an asset to view the chart'
  }, [asset])

  const lastPrice = useMemo(() => {
    const close = candlesticks.length ? candlesticks[candlesticks.length - 1].close : null
    return asset && asset.direction === Direction.LONG && parseInt(asset.price) ? Number(asset.price) : close
  }, [candlesticks, asset])

  const ytdChange = useMemo(() => {
    if (!candlesticks.length || !lastPrice) return ''
    const zeroDayPrice = candlesticks[0].close
    const change = ((lastPrice - zeroDayPrice) / zeroDayPrice) * 100
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}% Past Year`
  }, [candlesticks, lastPrice])

  const majorPriceLabel = useMemo(() => {
    return lastPrice ? lastPrice.toFixed(2) + ' USD' : '-'
  }, [lastPrice])

  const preMarketLabel = useMemo(() => {
    if (asset?.sector !== Sector.STOCKS || !quote || !preMarket) return null
    const change = `${quote.change > 0 ? '+' : ''}${quote.change.toFixed(2)}%`

    return (
      <div>
        Pre-market {quote.current.toFixed(2)} <MarketSpan positive={quote.change > 0}>{change}</MarketSpan>
      </div>
    )
  }, [asset, quote, preMarket])

  const afterHoursLabel = useMemo(() => {
    if (asset?.sector !== Sector.STOCKS || !quote || !afterHours) return null
    const change = `${quote.change > 0 ? '+' : ''}${quote.change.toFixed(2)}%`
    return (
      <div>
        After-hours {quote.current.toFixed(2)} <MarketSpan positive={quote.change > 0}>{change}</MarketSpan>
      </div>
    )
  }, [asset, quote, afterHours])

  useEffect(() => {
    const fetchTime = () => {
      setPreMarket(isPreMarket())
      setAfterHours(isAfterHours())
    }
    fetchTime()
    setInterval(() => fetchTime(), 60 * 1000)
  }, [])

  return (
    <Wrapper show={!!candlesticks.length} border={isSpiritTheme}>
      <InfoWrapper>
        <div>
          <UpperText>{cachedTicker}</UpperText>
          <BottomText>{cachedName}</BottomText>
        </div>
        <div>
          <UpperText>{majorPriceLabel}</UpperText>
          <BottomText>{ytdChange}</BottomText>
          {preMarketLabel && <BottomText>{preMarketLabel}</BottomText>}
          {afterHoursLabel && <BottomText>{afterHoursLabel}</BottomText>}
        </div>
      </InfoWrapper>
      <Chart data={candlesticks} dataKey="close" loading={candlesticksLoading} content={content} />
    </Wrapper>
  )
}
