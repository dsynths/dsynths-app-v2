import React, { useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import useWeb3React from 'hooks/useWeb3'
import Link from 'next/link'
import { CurrencyAmount, Token, ZERO } from '@sushiswap/core-sdk'
import { Eye, EyeOff } from 'react-feather'

import { useTokens, useAssetByContract } from 'hooks/useAssetList'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useTokenBalances } from 'state/wallet/hooks'

import ImageWithFallback from 'components/ImageWithFallback'
import { Loader } from 'components/Icons'
import { Card } from 'components/Card'
import ChainLabel from 'components/Icons/ChainLabel'
import { UnsupportedChainIdError } from '@web3-react/core'
import { ConductedStatus, useConductedState } from 'state/conducted/reducer'
import { DetailsStatus, useDetailsState } from 'state/details/reducer'
import { BaseButton } from 'components/Button'

const Wrapper = styled(Card)`
  height: 400px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 1rem;
  align-items: center;
  width: 100%;
  height: 3rem;
  padding: 0.5rem 1rem;
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
  & > * {
    &:last-child {
      margin-left: auto;
    }
  }
`

const NameWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  & > * {
    &:first-child {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.text1};
    }
    &:last-child {
      font-size: 0.7rem;
      color: ${({ theme }) => theme.text2};
    }
  }
`

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 0rem 1rem 1rem 1rem;
`
const HeaderWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
`

const LoadingContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`

const PrimaryLabel = styled.div`
  font-weight: normal;
  font-size: 12.5px;
  line-height: 20px;
  margin-right: 8px;
  color: ${({ theme }) => theme.text1};
`
const SecondaryLabel = styled.div`
  font-size: normal;
  font-weight: normal;
  font-size: 12.5px;
  line-height: 20px;
  color: ${({ theme }) => theme.text2};
`

type AssetMap = Array<{
  contract: string
  balance: CurrencyAmount<Token>
}>

export default function Portfolio() {
  const { account, error } = useWeb3React()
  const theme = useTheme()
  const assetTokens = useTokens()
  const assetBalances = useTokenBalances(account ?? undefined, assetTokens)
  const { status: conductedStatus } = useConductedState()
  const { status: detailsStatus } = useDetailsState()
  // TODO : Use this flag to display equity value in %
  const [showEquityPercentage, setShowEquityPercentage] = useState(false)

  const loading = !(conductedStatus === ConductedStatus.OK && detailsStatus === DetailsStatus.OK)
  // TODO : Have another loading state to show the state then filteredAssets are being processed
  //const assetsLoading = Object.keys(assetBalances).length === 0

  const filteredAssets = useMemo(() => {
    return Object.entries(assetBalances).reduce((acc: AssetMap, [contract, balance]) => {
      if (balance.greaterThan(ZERO)) {
        acc.push({ contract, balance })
      }
      return acc
    }, [])
  }, [assetBalances])

  const isSupportedChainId: boolean = useMemo(() => {
    if (error instanceof UnsupportedChainIdError) return false
    return true
  }, [error])

  const isWalletConnected: boolean = useMemo(() => {
    if (!account) return false
    return true
  }, [account])

  const getStatusLabel = () => {
    if (!isSupportedChainId) return 'Please connect to one of our supported networks'
    else if (!isWalletConnected) return 'Connect Wallet'
    else if (filteredAssets.length === 0)
      return (
        <>
          You don't own any synthetics. Click{' '}
          <Link href={'/trade'} passHref>
            here
          </Link>{' '}
          to own some.
        </>
      )
    return null
  }

  return (
    <Wrapper>
      <HeaderContainer>
        <HeaderWrapper>
          <PrimaryLabel>Positions</PrimaryLabel>
          <SecondaryLabel>{filteredAssets.length}</SecondaryLabel>
        </HeaderWrapper>
        <HeaderWrapper>
          <PrimaryLabel>Equity</PrimaryLabel>
          <BaseButton
            padding="0"
            $borderRadius="0"
            width={'1rem'}
            onClick={() => setShowEquityPercentage(!showEquityPercentage)}
          >
            {showEquityPercentage ? <EyeOff size="12.5px" /> : <Eye size="12.5px" />}
          </BaseButton>
        </HeaderWrapper>
      </HeaderContainer>
      {loading ? (
        <LoadingContainer>
          <PrimaryLabel>Loading assets</PrimaryLabel>
          <Loader size="12.5px" duration={'3s'} stroke={theme.text2} />
        </LoadingContainer>
      ) : filteredAssets.length > 0 ? (
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              itemCount={filteredAssets.length}
              itemSize={50}
              initialScrollOffset={0}
              itemData={filteredAssets}
            >
              {({ data, index, style }) => {
                const { contract, balance } = data[index]
                return <AssetRow key={index} contract={contract} balance={balance} style={style} />
              }}
            </List>
          )}
        </AutoSizer>
      ) : (
        <LoadingContainer>
          <PrimaryLabel>{getStatusLabel()}</PrimaryLabel>
        </LoadingContainer>
      )}
    </Wrapper>
  )
}

function AssetRow({
  contract,
  balance,
  style,
}: {
  contract: string
  balance: CurrencyAmount<Token>
  style: React.CSSProperties
}) {
  const { chainId } = useWeb3React()
  const asset = useAssetByContract(contract)
  const logo = useCurrencyLogo(asset?.id, asset?.symbol)
  const theme = useTheme()
  const assetOraclePrice = parseInt(asset?.price ? asset.price.toString() : '0')

  return (
    <Link href={`/asset?assetId=${contract}`} passHref>
      <Row style={style}>
        <ImageWithFallback src={logo} width={30} height={30} alt={`${asset?.symbol}`} />
        <NameWrapper>
          <div>{asset?.symbol}</div>
          <div>{asset?.name}</div>
        </NameWrapper>
        {balance ? (
          <PrimaryLabel>{balance?.toSignificant(6)}</PrimaryLabel>
        ) : (
          <Loader size="12px" duration={'3s'} stroke={theme.text2} />
        )}
        <ChainLabel chainId={chainId} />
        {balance ? (
          <PrimaryLabel>${balance.multiply(assetOraclePrice)?.toSignificant(6)}</PrimaryLabel>
        ) : (
          <Loader size="12px" duration={'3s'} stroke={theme.text2} />
        )}
      </Row>
    </Link>
  )
}
