import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import useDefaultsFromURL from 'state/trade/hooks'
import { Sector } from 'state/details/reducer'
import { useAssetByContract } from 'hooks/useAssetList'
import { API_BASE_URL } from 'constants/api'
import { makeHttpRequest } from 'utils/http'
import { isPreMarket, isAfterHours, isRegularMarket } from 'utils/time'
import { useIsJadeTheme } from 'hooks/useTheme'

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

  ${({ theme, show }) => theme.mediaWidth.upToSmall`
    height: ${show ? '200px' : '0px'};
  `}

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

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 3px;
    padding: 10px;
    margin-bottom: 2px;
  `}

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
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 1.1rem;
  `}
`

const BottomText = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `}
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
  const isJadeTheme = useIsJadeTheme()
  const [cachedTicker, setCachedTicker] = useState('')
  const [cachedName, setCachedName] = useState('')

  const [candlesticks, setCandlesticks] = useState<Candlestick[]>([])
  const [candlesticksCache, setCandlesticksCache] = useState<CandlesticksCache>({})
  const [candlesticksLoading, setCandlesticksLoading] = useState(false)

  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteCache, setQuoteCache] = useState<QuoteCache>({})
  const [quoteLoading, setQuoteLoading] = useState(false)

  const [preMarket, setPreMarket] = useState(false)
  const [regularHours, setRegularHours] = useState(true)
  const [afterHours, setAfterHours] = useState(false)

  const { currencies } = useDefaultsFromURL()
  const asset = useAssetByContract(currencies.baseCurrency?.wrapped.address ?? undefined)

  const fetchCandlesticks = useCallback(
    async (ticker: string, sector: Sector) => {
      try {
        if (candlesticksLoading) return []

        const { href: url } = new URL(
          `/${sector.toLowerCase()}/ohlc?ticker=${ticker}&period=y&resolution=D`,
          API_BASE_URL
        )
        setCandlesticksLoading(true)
        const result: CandlestickResponse = await makeHttpRequest(url)
        setCandlesticksLoading(false)

        if (!result || !result.success) {
          throw new Error(result?.message)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asset]
  )

  const fetchQuote = useCallback(
    async (ticker: string, sector: Sector) => {
      try {
        if (sector !== Sector.STOCKS || quoteLoading) return null

        const { href: url } = new URL(`/stocks/quote?ticker=${ticker}`, API_BASE_URL)
        setQuoteLoading(true)
        const result: QuoteResponse = await makeHttpRequest(url)
        setQuoteLoading(false)

        if (!result || !result.success) {
          throw new Error(result?.message)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asset]
  )

  useEffect(() => {
    const { name, ticker, sector } = asset ?? { name: 'Tesla Inc.', ticker: 'TSLA', sector: Sector.STOCKS }

    setCachedTicker(ticker)
    setCachedName(name)

    if (candlesticksCache[ticker]) {
      setCandlesticks(candlesticksCache[ticker])
    } else {
      fetchCandlesticks(ticker, sector)
    }

    if (quoteCache[ticker]) {
      setQuote(quoteCache[ticker])
    } else {
      fetchQuote(ticker, sector)
    }
  }, [asset, chainId, candlesticksCache, quoteCache, fetchCandlesticks, fetchQuote])

  const majorPrice: number | null = useMemo(() => {
    // general note: if the API is down or faulty, the linechart will hide itself by default
    // so we don't have to think of those edge cases.

    // quotes are only available for stocks, nor do special hours exist for non-stocks
    // only show LONG price, else default to current candlestick price (only then fallback to SHORT price)
    if (asset?.sector !== Sector.STOCKS) {
      const candleClose = candlesticks.length ? candlesticks[candlesticks.length - 1].close : null
      if (!asset || !parseFloat(asset.price)) {
        return candleClose
      }
      return asset.direction === Direction.LONG ? Number(asset.price) : candleClose ?? Number(asset.price)
    }

    if (!asset) return null

    // if no quote: default to asset price (we don't have to resort to candlesticks price
    // because if there's no quote then the API won't return candlesticks either)
    if (!quote) {
      return parseFloat(asset.price) ? Number(asset.price) : null
    }
    const { close, current } = quote

    // If regular hours, use oracle price
    if (regularHours) {
      if (!parseFloat(asset.price) || asset.direction === Direction.SHORT) {
        return current
      }
      return Number(asset.price)
    }

    // Market is closed or is special hours
    return close
  }, [asset, candlesticks, quote, regularHours])

  const ytdChange: string = useMemo(() => {
    if (!candlesticks.length) return ''
    const zeroDayPrice = candlesticks[0].close
    const lastPrice = candlesticks[candlesticks.length - 1].close
    const change = ((lastPrice - zeroDayPrice) / zeroDayPrice) * 100
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}% Past Year`
  }, [candlesticks])

  const [hoverPrice, setHoverPrice] = useState<number | null>(null)
  const majorPriceLabel = useMemo(() => {
    const value = hoverPrice ?? majorPrice
    return value ? value.toFixed(2) + ' USD' : '-'
  }, [majorPrice, hoverPrice])

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
      setRegularHours(isRegularMarket())
    }
    fetchTime()
    setInterval(() => fetchTime(), 60 * 1000)
  }, [])

  const onTooltipHover = (value: number, shouldReset: boolean) => {
    setHoverPrice(shouldReset ? null : value)
  }

  return (
    <Wrapper show={!!candlesticks.length} border={isJadeTheme}>
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
      <Chart data={candlesticks} dataKey="close" loading={candlesticksLoading} onTooltipHover={onTooltipHover} />
    </Wrapper>
  )
}
