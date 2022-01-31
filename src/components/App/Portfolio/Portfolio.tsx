import React, { useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import useWeb3React from 'hooks/useWeb3'
import Link from 'next/link'
import { CurrencyAmount, Token, ZERO } from '@sushiswap/core-sdk'
import { ToggleRight } from 'react-feather'

import { useTokens, useAssetByContract } from 'hooks/useAssetList'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useTokenBalances } from 'state/wallet/hooks'

import { SynchronizerChains } from 'constants/chains'
import ImageWithFallback from 'components/ImageWithFallback'
import { Loader } from 'components/Icons'
import { Card } from 'components/Card'
import ChainLabel from 'components/Icons/ChainLabel'

const Wrapper = styled(Card)`
  height: 400px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 16px;
  align-items: center;
  width: 100%;
  height: 50px;
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
  padding: 0px 16px 16px 16px;
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
  padding: 16px;
`

const PrimaryLabel = styled.div`
  font-size: normal;
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
  const { chainId, account } = useWeb3React()
  const theme = useTheme()
  const assetTokens = useTokens()
  const assetBalances = useTokenBalances(account ?? undefined, assetTokens)

  /**
   * If you want to create loaders... check out:
   * - state/conducted
   * - state/details
   *
   * Both have a status enum built-in, use those. Loading is fully done when both are OK.
   */
  // this line is purely for demonstration purposes, pls remove it and replace it with the above described hooks
  const [loading, setLoading] = useState(false)

  const filteredAssets = useMemo(() => {
    return Object.entries(assetBalances).reduce((acc: AssetMap, [contract, balance]) => {
      if (balance.greaterThan(ZERO)) {
        acc.push({ contract, balance })
      }
      return acc
    }, [])
  }, [assetBalances])

  const isSupportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return SynchronizerChains.includes(chainId)
  }, [chainId, account])

  return (
    <Wrapper>
      <HeaderContainer>
        <HeaderWrapper>
          <PrimaryLabel>Positions</PrimaryLabel>
          <SecondaryLabel>{filteredAssets.length}</SecondaryLabel>
        </HeaderWrapper>
        <HeaderWrapper>
          <PrimaryLabel>Equity</PrimaryLabel>
          <ToggleRight size="12.5px" />
        </HeaderWrapper>
      </HeaderContainer>
      {loading ? (
        <LoadingContainer>
          <PrimaryLabel>No asset</PrimaryLabel>
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
          <PrimaryLabel>You don't own any synthetics. Click to trade or something?</PrimaryLabel>
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
