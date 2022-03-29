import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Virtual } from 'swiper'
import styled from 'styled-components'
import { areEqual } from 'react-window'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/virtual'

import useWeb3React from 'hooks/useWeb3'
import { useRegistrarByContract } from 'lib/synchronizer/hooks'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import { TOPMARKETS, TopMarket } from 'apollo/queries'
import { getApolloClient } from 'apollo/client/synchronizer'
import { formatDollarAmount } from 'utils/numbers'
import { FALLBACK_CHAIN_ID } from 'constants/chains'

import { Card } from 'components/Card'
import ImageWithFallback from 'components/ImageWithFallback'

const Wrapper = styled(Card)`
  display: flex;
  flex-basis: calc(50% - 0.5rem);
  justify-content: center;
  padding: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.75rem;
  `}

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
`

const SwiperContainer = styled(Swiper)`
  padding: 1rem 0rem 2rem 0rem;

  .swiper-pagination-bullet {
    background: white;
  }
  .swiper-pagination-bullet-active {
    background: ${({ theme }) => theme.yellow1};
  }
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.8rem;
    line-height: 1rem;
  `}
`

const TitleSecondaryLabel = styled.div`
  font-size: 0.7rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.6rem;
    line-height: 0.8rem;
  `}
`

const Divider = styled.div`
  margin: 0.5rem 0rem;
  border: 1px solid ${({ theme }) => theme.border2};
`

const BodyContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
`

const DetailsWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
`

const LogoWrapper = styled.div`
  margin-right: 0.5rem;
  border-radius: 50%;
`

const AssetDetailsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: start;
`

const LoadingContainer = styled(Card)`
  display: flex;
  text-align: center;
  padding: 3rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 2.25rem;
`}

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
`

const BodyPrimaryLabel = styled.div`
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.8rem;
    line-height: 1rem;
  `}
`

const BodySecondaryLabel = styled.div`
  font-size: 0.7rem;
  line-height: 1rem;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.6rem;
    line-height: 0.8rem;
  `}
`

const AssetPriceText = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: end;
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.8rem;
    line-height: 1rem;
  `}
`

const TOP_MARKETS_COUNT = 10

export default function TrendingMarkets() {
  const { chainId } = useWeb3React()
  const [trendingMarkets, setTrendingMarkets] = useState<TopMarket[]>([])

  const fetchTrendingMarkets = useCallback(async () => {
    const DEFAULT_RETURN: TopMarket[] = []
    try {
      const client = getApolloClient(chainId ?? FALLBACK_CHAIN_ID)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: TOPMARKETS,
        variables: { count: TOP_MARKETS_COUNT },
        fetchPolicy: 'no-cache',
      })

      return data.registrars as TopMarket[]
    } catch (error) {
      console.log('Unable to fetch TopMarkets from The Graph Network')
      console.error(error)
      return []
    }
  }, [chainId])

  useEffect(() => {
    const getTransactions = async () => {
      const result = await fetchTrendingMarkets()
      setTrendingMarkets(result)
    }
    getTransactions()
  }, [fetchTrendingMarkets])

  return (
    <div>
      <SwiperContainer
        modules={[Autoplay, Pagination, Virtual]}
        cssMode={true}
        spaceBetween={0}
        slidesPerView={1}
        slidesPerGroup={1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          // display 2 cards per row above this screen width
          640: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 16,
          },
        }}
      >
        {trendingMarkets.length > 0 ? (
          trendingMarkets.map((asset: TopMarket, index) => (
            <SwiperSlide key={index}>
              <MemoizedAssetCard asset={asset} index={index + 1} />
            </SwiperSlide>
          ))
        ) : (
          <LoadingContainer>Loading Trending Markets...</LoadingContainer>
        )}
      </SwiperContainer>
    </div>
  )
}

const MemoizedAssetCard = React.memo(AssetCard, areEqual)

function AssetCard({ asset, index }: { asset: TopMarket; index: number }) {
  const router = useRouter()
  const registrar = useRegistrarByContract(asset.id)

  const { ticker, contract, price, volume, isMarketOpen } = useMemo(
    () => ({
      ticker: registrar?.ticker ?? '',
      contract: registrar?.contract ?? '',
      price: registrar ? parseFloat(registrar.price) : 0,
      volume: registrar ? parseFloat(asset.quoteVolume) : 0,
      isMarketOpen: !!registrar?.open,
    }),
    [registrar, asset]
  )
  const logo = useCurrencyLogo(ticker, undefined)

  const buildUrl = useCallback(
    (contract: string) => {
      const queryString = Object.keys(router.query)
        .map((key) => key + '=' + router.query[key])
        .join('&')
      return queryString ? `/trade?registrarId=${contract}&${queryString}` : `/trade?registrarId=${contract}`
    },
    [router]
  )

  return (
    <Link href={buildUrl(contract)} passHref>
      <Wrapper>
        <TitleContainer>
          <TitlePrimaryLabel>#{index}</TitlePrimaryLabel>
          <TitleSecondaryLabel>Volume: {formatDollarAmount(volume)}</TitleSecondaryLabel>
        </TitleContainer>
        <Divider />
        <BodyContainer>
          <DetailsWrapper>
            <LogoWrapper>
              <ImageWithFallback src={logo} alt={`${asset.name} Logo`} width={32} height={32} />{' '}
            </LogoWrapper>
            <AssetDetailsContainer>
              <BodyPrimaryLabel>{asset.symbol}</BodyPrimaryLabel>
              <BodySecondaryLabel>{asset.name}</BodySecondaryLabel>
            </AssetDetailsContainer>
          </DetailsWrapper>
          <AssetPriceText>{isMarketOpen ? formatDollarAmount(price) : 'Market closed'}</AssetPriceText>
        </BodyContainer>
      </Wrapper>
    </Link>
  )
}
