import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import useWeb3React from 'hooks/useWeb3'

import { SynchroniserStat, STATS } from 'apollo/queries'
import { getApolloClient } from 'apollo/client/synchronizer'
import { formatDollarAmount } from 'utils/numbers'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { DotFlashing } from 'components/Icons'

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 40px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
      display: none;
  `}
`

const PrimaryLabel = styled.div`
  font-size: 1.5rem;
  line-height: 1.75rem;
  color: ${({ theme }) => theme.yellow1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 1rem;
    line-height: 1.25rem;
  `}
`

const SecondaryLabel = styled.div`
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.8rem;
    line-height: 1rem;
  `}
`

export default function SynchroniserStats() {
  const { chainId = FALLBACK_CHAIN_ID } = useWeb3React()
  const [stats, setStats] = useState<SynchroniserStat | null>()
  const theme = useTheme()

  const fetchSynchroniserStats = useCallback(async () => {
    const DEFAULT_RETURN: SynchroniserStat | null = null
    try {
      const client = getApolloClient(chainId)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: STATS,
        fetchPolicy: 'no-cache',
      })

      return data.synchronizers[0] as SynchroniserStat
    } catch (error) {
      console.log('Unable to fetch SynchroniserStats from The Graph Network')
      console.error(error)
      return null
    }
  }, [chainId])

  useEffect(() => {
    const getSynchroniserStats = async () => {
      const result = await fetchSynchroniserStats()
      setStats(result)
    }
    getSynchroniserStats()
  }, [fetchSynchroniserStats])

  const {
    totalVolume = 0,
    registrarCount = 0,
    tradeCount = 0,
  } = useMemo(
    () => ({
      totalVolume: formatDollarAmount(Number(stats?.totalVolumeDEI ?? '0')),
      registrarCount: parseInt(stats?.registrarCount ?? '0') / 2 ?? 0,
      tradeCount: stats?.txCount ?? 0,
    }),
    [stats]
  )

  return (
    <Container>
      <div>
        {!stats ? (
          <DotFlashing colour={theme.yellow1} size={'12px'} gap={'2px'} style={{ padding: '8px' }} />
        ) : (
          <PrimaryLabel>{totalVolume}</PrimaryLabel>
        )}
        <SecondaryLabel>Global Trading Volume</SecondaryLabel>
      </div>
      <div>
        {!stats ? (
          <DotFlashing colour={theme.yellow1} size={'12px'} gap={'2px'} style={{ padding: '8px' }} />
        ) : (
          <PrimaryLabel>{registrarCount}</PrimaryLabel>
        )}
        <SecondaryLabel>Assets to Trade</SecondaryLabel>
      </div>
      <div>
        {!stats ? (
          <DotFlashing colour={theme.yellow1} size={'12px'} gap={'2px'} style={{ padding: '8px' }} />
        ) : (
          <PrimaryLabel>{tradeCount}+</PrimaryLabel>
        )}
        <SecondaryLabel>Unique Trades</SecondaryLabel>
      </div>
    </Container>
  )
}
