import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import { useRouter } from 'next/router'
import { TOPMARKETS, TopMarkets } from 'apollo/queries'
import { getApolloClient } from 'apollo/client/synchronizer'

import { formatDollarAmount } from 'utils/numbers'
import { useRegistrarByContract } from 'lib/synchronizer/hooks'
import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'

const Wrapper = styled(Card)`
  display: flex;
  flex-basis: calc(50% - 0.5rem);
  justify-content: center;
  padding: 1rem;
`

const AssetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 1rem;
  margin: 1rem 0rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const TitleText = styled.div`
  font-size: 1.5rem;
  line-height: 1.75rem;
  color: ${({ theme }) => theme.yellow1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const TitleContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
`

const TitlePrimaryLabel = styled.div`
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.text1};
`

const TitleSecondaryLabel = styled.div`
  font-size: 0.7rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.text2};
`

const Divider = styled.div`
  margin: 0.5rem 0rem;
  border: 1px solid ${({ theme }) => theme.yellow1};
`

const BodyContainer = styled(ExternalLink)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
`

const AssetDetailsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: start;
`

const BodyPrimaryLabel = styled.div`
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.text1};
`
const BodySecondaryLabel = styled.div`
  font-size: 0.7rem;
  line-height: 1rem;
  color: ${({ theme }) => theme.text2};
`

const AssetPriceText = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: end;
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.text1};
`

const TOP_MARKETS_COUNT = 4

export default function TrendingMarkets() {
  const { chainId, account } = useWeb3React()
  const [trendingMarkets, setTrendingMarkets] = useState<TopMarkets[]>([])

  const fetchTrendingMarkets = useCallback(async () => {
    const DEFAULT_RETURN: TopMarkets[] = []
    try {
      if (!account || !chainId) return DEFAULT_RETURN
      const client = getApolloClient(chainId)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: TOPMARKETS,
        variables: { count: TOP_MARKETS_COUNT },
        fetchPolicy: 'no-cache',
      })

      return data.registrars as TopMarkets[]
    } catch (error) {
      console.log('Unable to fetch registrars from The Graph Network')
      console.error(error)
      return []
    }
  }, [chainId, account])

  useEffect(() => {
    const getTransactions = async () => {
      const result = await fetchTrendingMarkets()
      setTrendingMarkets(result)
    }
    getTransactions()
  }, [fetchTrendingMarkets])

  return (
    <div>
      <TitleText>TOP {TOP_MARKETS_COUNT} ASSETS BY TRADING VOLUME</TitleText>
      <AssetContainer>
        {trendingMarkets.map((asset, index) => (
          <AssetCard key="index" asset={asset} index={index + 1} />
        ))}
      </AssetContainer>
    </div>
  )

  function AssetCard({ asset, index }: { asset: TopMarkets; index: number }) {
    const router = useRouter()

    const registrar = useRegistrarByContract(asset.id ?? '')
    const contract = registrar?.contract || ''
    const price = Number(registrar?.price || '')
    const volume = Number(asset.quoteVolume)
    const isMarketOpen = registrar?.open

    const buildUrl = useCallback(
      (contract: string) => {
        const queryString = Object.keys(router.query)
          .map((key) => key + '=' + router.query[key])
          .join('&')
        return `/trade?registrarId=${contract}&${queryString}`
      },
      [router]
    )

    return (
      <Wrapper>
        <TitleContainer>
          <TitlePrimaryLabel>#{index}</TitlePrimaryLabel>
          <TitleSecondaryLabel>Volume: {formatDollarAmount(volume)}</TitleSecondaryLabel>
        </TitleContainer>
        <Divider />
        <BodyContainer href={buildUrl(contract)} passHref>
          <AssetDetailsContainer>
            <BodyPrimaryLabel>{asset.symbol}</BodyPrimaryLabel>
            <BodySecondaryLabel>{asset.name}</BodySecondaryLabel>
          </AssetDetailsContainer>
          <AssetPriceText>{isMarketOpen ? formatDollarAmount(price) : 'Market closed'}</AssetPriceText>
        </BodyContainer>
      </Wrapper>
    )
  }
}
