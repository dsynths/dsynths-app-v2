import React, { useMemo } from 'react'
import Link from 'next/link'
import styled, { useTheme } from 'styled-components'
import { Eye, EyeOff } from 'react-feather'
import BigNumber from 'bignumber.js'

import useWeb3React from 'hooks/useWeb3'
import { useAssetByContract } from 'hooks/useAssetList'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { ConductedStatus, useConductedState } from 'state/conducted/reducer'
import { DetailsStatus, useDetailsState } from 'state/details/reducer'
import { useWalletModalToggle } from 'state/application/hooks'
import { TokenBalancesMap } from 'state/wallet/types'

import { AssetMap, OwnedAsset } from 'pages/portfolio'
import { formatDollarAmount } from 'utils/numbers'

import ImageWithFallback from 'components/ImageWithFallback'
import { Loader } from 'components/Icons'
import { Card } from 'components/Card'
// import ChainLabel from 'components/Icons/ChainLabel'
import { BaseButton, PrimaryButton } from 'components/Button'
import { SynchronizerChains } from 'constants/chains'

const Wrapper = styled(Card)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 10px;
  `}
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 1rem;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0;
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
      ${({ theme }) => theme.mediaWidth.upToMedium`
        font-size: 0.7rem;
      `}
    }
    &:last-child {
      font-size: 0.7rem;
      color: ${({ theme }) => theme.text2};
      ${({ theme }) => theme.mediaWidth.upToMedium`
        font-size: 0.6rem;
      `}
    }
  }
`

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-bottom: 5px;
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

export default function Portfolio({
  balances,
  assets,
  totalEquity,
  showEquity,
  setShowEquity,
}: {
  balances: TokenBalancesMap
  assets: AssetMap
  totalEquity: BigNumber
  showEquity: boolean
  setShowEquity: () => void
}) {
  const { chainId, account } = useWeb3React()
  const theme = useTheme()

  const { status: conductedStatus } = useConductedState()
  const { status: detailsStatus } = useDetailsState()
  const toggleWalletModal = useWalletModalToggle()

  const isLoading: boolean = useMemo(() => {
    const balancesLoading = !!Object.keys(balances).length
    return !(balancesLoading && conductedStatus === ConductedStatus.OK && detailsStatus === DetailsStatus.OK)
  }, [conductedStatus, detailsStatus, balances])

  const isSupportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return SynchronizerChains.includes(chainId)
  }, [chainId, account])

  const isWalletConnected: boolean = useMemo(() => {
    return !!account
  }, [account])

  // temporarily notify user about the pricing issue during market-close hours
  // const hasPricingIssue: boolean = useMemo(() => {
  //   return assetList.map((asset) => !!asset.price).includes(false)
  // }, [assetList])

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

    if (!assets.length) {
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
          <SecondaryLabel>{assets.length}</SecondaryLabel>
        </HeaderWrapper>
        <HeaderWrapper hover onClick={setShowEquity}>
          <PrimaryLabel>Equity</PrimaryLabel>
          <BaseButton padding="0" $borderRadius="0" width={'1rem'}>
            {showEquity ? <Eye size="12.5px" /> : <EyeOff size="12.5px" />}
          </BaseButton>
        </HeaderWrapper>
      </HeaderContainer>
      {getStatusLabel() ? (
        <LoadingContainer>{getStatusLabel()}</LoadingContainer>
      ) : (
        <>
          {assets.map((owned, index) => (
            <AssetRow key={index} owned={owned} totalEquity={totalEquity} showEquity={showEquity} />
          ))}
        </>
      )}
    </Wrapper>
  )
}

function AssetRow({
  owned: { contract, balance, equity },
  totalEquity,
  showEquity,
}: {
  owned: OwnedAsset
  totalEquity: BigNumber
  showEquity: boolean
}) {
  // const { chainId } = useWeb3React()
  const asset = useAssetByContract(contract)
  const logo = useCurrencyLogo(asset?.id, asset?.symbol)

  const equityLabel = useMemo(() => {
    return showEquity ? formatDollarAmount(equity.toNumber()) : `${equity.div(totalEquity).times(100).toFixed(2)}%`
  }, [equity, totalEquity, showEquity])

  return (
    <Link href={`/trade?assetId=${contract}`} passHref>
      <Row>
        <ImageWithFallback src={logo} width={30} height={30} alt={`${asset?.symbol}`} />
        <NameWrapper>
          <div>{asset?.symbol}</div>
          <div>{asset?.name}</div>
        </NameWrapper>
        {showEquity && <PrimaryLabel>{balance?.toSignificant(6)}</PrimaryLabel>}
        {/* <ChainLabel chainId={chainId} /> */}
        <PrimaryLabel>{equityLabel}</PrimaryLabel>
      </Row>
    </Link>
  )
}
