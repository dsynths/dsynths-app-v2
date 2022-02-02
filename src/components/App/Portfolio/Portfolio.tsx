import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import styled, { useTheme } from 'styled-components'
import { CurrencyAmount, Token, ZERO } from '@sushiswap/core-sdk'
import { Eye, EyeOff } from 'react-feather'
import BigNumber from 'bignumber.js'

import useWeb3React from 'hooks/useWeb3'
import { useTokens, useAssetByContract, useSubAssetList } from 'hooks/useAssetList'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useTokenBalances } from 'state/wallet/hooks'
import { ConductedStatus, useConductedState } from 'state/conducted/reducer'
import { DetailsStatus, useDetailsState } from 'state/details/reducer'

import ImageWithFallback from 'components/ImageWithFallback'
import { Loader } from 'components/Icons'
import { Card } from 'components/Card'
// import ChainLabel from 'components/Icons/ChainLabel'
import { BaseButton, PrimaryButton } from 'components/Button'
import { SynchronizerChains } from 'constants/chains'
import { formatDollarAmount } from 'utils/numbers'
import { useWalletModalToggle } from 'state/application/hooks'

const Wrapper = styled(Card)``

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
const HeaderWrapper = styled.div<{
  hover?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;

  ${({ hover }) =>
    hover &&
    `
    &:hover {
      cursor: pointer;
    }
  `}
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

  & > span {
    color: ${({ theme }) => theme.primary3};
    &:hover {
      cursor: pointer;
    }
  }
`
const SecondaryLabel = styled.div`
  font-size: normal;
  font-weight: normal;
  font-size: 12.5px;
  line-height: 20px;
  color: ${({ theme }) => theme.text2};
`

interface OwnedAsset {
  contract: string
  balance: CurrencyAmount<Token>
  equity: BigNumber
}

type AssetMap = Array<OwnedAsset>

function sortBalances(a: OwnedAsset, b: OwnedAsset) {
  return a.equity.gte(b.equity) ? -1 : 1
}

export default function Portfolio() {
  const { chainId, account } = useWeb3React()
  const theme = useTheme()
  const assetList = useSubAssetList()
  const assetTokens = useTokens()
  const assetBalances = useTokenBalances(account ?? undefined, assetTokens)
  const { status: conductedStatus } = useConductedState()
  const { status: detailsStatus } = useDetailsState()
  const [showEquityPercentage, setShowEquityPercentage] = useState(false)
  const toggleWalletModal = useWalletModalToggle()

  const isLoading: boolean = useMemo(() => {
    const balancesLoading = !!Object.keys(assetBalances).length
    return !(balancesLoading && conductedStatus === ConductedStatus.OK && detailsStatus === DetailsStatus.OK)
  }, [conductedStatus, detailsStatus, assetBalances])

  const isSupportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return SynchronizerChains.includes(chainId)
  }, [chainId, account])

  const isWalletConnected: boolean = useMemo(() => {
    return !!account
  }, [account])

  const filteredAssets = useMemo(() => {
    const unsorted = Object.entries(assetBalances).reduce((acc: AssetMap, [contract, balance]) => {
      if (balance.equalTo(ZERO)) return acc

      const asset = assetList.find((asset) => asset.contract === contract)
      const price = asset ? new BigNumber(asset.price.toString()) : new BigNumber('0')
      const equity = new BigNumber(balance.toExact()).times(price)
      acc.push({ contract, balance, equity })
      return acc
    }, [])

    return unsorted.sort(sortBalances)
  }, [assetBalances, assetList])

  const totalEquity = useMemo(() => {
    return filteredAssets.reduce((acc: BigNumber, { equity }) => {
      return acc.plus(equity)
    }, new BigNumber('0'))
  }, [filteredAssets])

  function getStatusLabel(): JSX.Element | null {
    if (!isWalletConnected) {
      return (
        <>
          <PrimaryButton onClick={() => toggleWalletModal()}>Connect Wallet</PrimaryButton>
        </>
      )
    }

    if (!isSupportedChainId) {
      return <PrimaryLabel>Please connect to one of our supported networks.</PrimaryLabel>
    }

    if (isLoading) {
      return (
        <>
          <PrimaryLabel>Loading assets</PrimaryLabel>
          <Loader size="12.5px" duration={'3s'} stroke={theme.text2} />
        </>
      )
    }

    if (!filteredAssets.length) {
      return (
        <PrimaryLabel>
          You don&apos;t own any synthetics. Click&nbsp;
          <Link href="/trade" passHref>
            <span>here</span>
          </Link>
          &nbsp;to start trading.
        </PrimaryLabel>
      )
    }
    return null
  }

  return (
    <Wrapper>
      <HeaderContainer>
        <HeaderWrapper>
          <PrimaryLabel>Positions</PrimaryLabel>
          <SecondaryLabel>{filteredAssets.length}</SecondaryLabel>
        </HeaderWrapper>
        <HeaderWrapper hover onClick={() => setShowEquityPercentage(!showEquityPercentage)}>
          <PrimaryLabel>Equity</PrimaryLabel>
          <BaseButton padding="0" $borderRadius="0" width={'1rem'}>
            {showEquityPercentage ? <EyeOff size="12.5px" /> : <Eye size="12.5px" />}
          </BaseButton>
        </HeaderWrapper>
      </HeaderContainer>
      {getStatusLabel() ? (
        <LoadingContainer>{getStatusLabel()}</LoadingContainer>
      ) : (
        <>
          {filteredAssets.map((owned: OwnedAsset, index) => (
            <AssetRow key={index} owned={owned} totalEquity={totalEquity} showEquityPercentage={showEquityPercentage} />
          ))}
        </>
      )}
    </Wrapper>
  )
}

function AssetRow({
  owned: { contract, balance, equity },
  totalEquity,
  showEquityPercentage,
}: {
  owned: OwnedAsset
  totalEquity: BigNumber
  showEquityPercentage: boolean
}) {
  // const { chainId } = useWeb3React()
  const asset = useAssetByContract(contract)
  const logo = useCurrencyLogo(asset?.id, asset?.symbol)

  const equityLabel = useMemo(() => {
    return showEquityPercentage
      ? `${equity.div(totalEquity).times(100).toFixed(2)}%`
      : formatDollarAmount(equity.toNumber())
  }, [equity, totalEquity, showEquityPercentage])

  return (
    <Link href={`/trade?assetId=${contract}`} passHref>
      <Row>
        <ImageWithFallback src={logo} width={30} height={30} alt={`${asset?.symbol}`} />
        <NameWrapper>
          <div>{asset?.symbol}</div>
          <div>{asset?.name}</div>
        </NameWrapper>
        {!showEquityPercentage && <PrimaryLabel>{balance?.toSignificant(6)}</PrimaryLabel>}
        {/* <ChainLabel chainId={chainId} /> */}
        <PrimaryLabel>{equityLabel}</PrimaryLabel>
      </Row>
    </Link>
  )
}
