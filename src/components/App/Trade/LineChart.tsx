import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import useDefaultsFromURL from 'state/trade/hooks'
import { useAssetByContract } from 'hooks/useAssetList'
import { API_BASE_URL } from 'constants/api'
import { makeHttpRequest } from 'utils/http'

import { LineChart as Chart } from 'components/Chart'
import { Card } from 'components/Card'
import { Direction } from 'hooks/useTradePage'
import { formatDollarAmount } from 'utils/numbers'

const Wrapper = styled(Card)<{
  show: boolean
}>`
  padding: 0;
  height: ${({ show }) => (show ? '285px' : '0px')}; // exact infowrapper + last-child height

  -webkit-transition: height 0.4s linear;
  -moz-transition: height 0.4s linear;
  -ms-transition: height 0.4s linear;
  -o-transition: height 0.4s linear;
  transition: height 0.4s linear;

  & > * {
    &:last-child {
      height: 200px;
    }
  }
`

const InfoWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.border2};
  padding: 0 20px;
  height: 85px;
  align-items: center;
  margin-bottom: 4px;

  & > * {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
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

type APIResponse = {
  success: boolean
  data: Candlestick[]
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

interface Cache {
  [ticker: string]: Candlestick[]
}

export default function LineChart() {
  // Prevent jumping on long/short switches + lessen load on API
  const [cache, setCache] = useState<Cache>({})
  const [cachedTicker, setCachedTicker] = useState('')
  const [cachedName, setCachedName] = useState('')

  const [data, setData] = useState<Candlestick[]>([])
  const [loading, setLoading] = useState(false)

  const { currencies } = useDefaultsFromURL()
  const asset = useAssetByContract(currencies.baseCurrency?.wrapped.address ?? undefined)

  const fetchCandlesticks = useCallback(
    async (ticker: string) => {
      try {
        const { href: url } = new URL(`/${asset?.sector}/ohlc?ticker=${ticker}&period=y&resolution=D`, API_BASE_URL)
        setLoading(true)
        const result: APIResponse = await makeHttpRequest(url)
        setLoading(false)

        if (!result || !result.success) {
          throw new Error(`API returned an error: ${result?.message}`)
        }
        if (!Array.isArray(result.data)) {
          throw new Error('API data is not an array')
        }

        setData(result.data)
        setCache((prev) => ({
          ...prev,
          [ticker]: result.data,
        }))
      } catch (err) {
        console.error(err)
        setData([])
        setLoading(false)
      }
    },
    [asset]
  )

  useEffect(() => {
    if (!asset) return

    setCachedTicker(asset.ticker)
    setCachedName(asset.name)

    if (cache[asset.ticker]) {
      setData(cache[asset.ticker])
      return
    }

    fetchCandlesticks(asset.ticker)
  }, [asset, cache, fetchCandlesticks])

  const placeholder = useMemo(() => {
    return asset ? 'Chart is not available' : 'Select an asset to view the chart'
  }, [asset])

  const priceLabel = useMemo(() => {
    const close = data.length ? data[data.length - 1].close : ''
    const result = asset ? (asset.direction === Direction.SHORT ? close : !!asset.price ? asset.price : close) : ''
    return result ? formatDollarAmount(result) : ''
  }, [data, asset])

  const priceChangeLabel = useMemo(() => {
    if (!data.length) return ''
    const currentPrice = data[data.length - 1].close
    const zeroDayPrice = data[0].close

    const change = ((currentPrice - zeroDayPrice) / zeroDayPrice) * 100
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}% Past Year`
  }, [data])

  return (
    <Wrapper show={!!data.length}>
      <InfoWrapper>
        <div>
          <UpperText>{cachedTicker}</UpperText>
          <BottomText>{cachedName}</BottomText>
        </div>
        <div>
          <UpperText>{priceLabel}</UpperText>
          <BottomText>{priceChangeLabel}</BottomText>
        </div>
      </InfoWrapper>
      <Chart data={data} dataKey="close" loading={loading} placeholder={placeholder} />
    </Wrapper>
  )
}
