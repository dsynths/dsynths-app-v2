import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Direction } from '@deusfinance/synchronizer-sdk'
import { useRegistrarByContract } from 'lib/synchronizer/hooks'
import { useTimeElapsed, useUserTokens } from 'hooks/useClaimTokens'
import { useSynchronizerContract } from 'hooks/useContract'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'

import { Card } from 'components/Card'
import ImageWithFallback from 'components/ImageWithFallback'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { useTransactionAdder } from 'state/transactions/hooks'
import { Collateral } from 'constants/addresses'
import { useCurrency } from 'hooks/useCurrency'

const Wrapper = styled(Card)<{
  border?: boolean
}>`
  justify-content: flex-start;
  padding: 1rem;
  overflow: visible;
  box-shadow: ${({ theme }) => theme.boxShadow2};
  border: 1px solid ${({ theme, border }) => (border ? theme.border2 : 'transparent')};
  gap: 5px;

  & > * {
    &:last-child {
      margin-top: 10px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.7rem;
  `}
`

const Header = styled.div`
  margin: 1rem 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0.5rem 0;
  `}
`

const Row = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
`

const NameWrapper = styled.div<{
  long?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  gap: 8px;
  align-items: center;
  & > * {
    &:first-child {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.text1};
      ${({ theme }) => theme.mediaWidth.upToMedium`
        font-size: 0.7rem;
      `}
    }
    &:nth-child(2) {
      font-size: 0.7rem;
      color: ${({ theme }) => theme.text2};
      ${({ theme }) => theme.mediaWidth.upToMedium`
        font-size: 0.6rem;
      `}
    }
    &:nth-child(3) {
      font-size: 0.5rem;
      color: white;
      padding: 0.1rem 0.2rem;
      border-radius: 3px;
      background: ${({ theme, long }) => (long ? theme.green1 : theme.red1)};
      ${({ theme }) => theme.mediaWidth.upToMedium`
        font-size: 0.4rem;
      `}
    }
  }
`

export default function Claim() {
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const { account } = useWeb3React()
  const tokens = useUserTokens()
  const { remainingSeconds, claimable } = useTimeElapsed()
  const Synchronizer = useSynchronizerContract()
  const addTransaction = useTransactionAdder()

  const nonDuplicateTokens = useMemo(() => {
    return tokens.reduce((acc: string[], address) => {
      if (acc.includes(address)) return acc
      acc.push(address)
      return acc
    }, [])
  }, [tokens])

  const onClaim = useCallback(async () => {
    try {
      if (!account || !Synchronizer) return null
      setPendingConfirmation(true)
      const tx = await Synchronizer.collect(account)
      setPendingConfirmation(false)
      addTransaction(tx, { summary: 'Claim Tokens' })
    } catch (err) {
      setPendingConfirmation(false)
      console.error(err)
    }
  }, [account, Synchronizer, addTransaction])

  function getButton() {
    if (pendingConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (!claimable) {
      return <PrimaryButton disabled>Claim available in {remainingSeconds}s</PrimaryButton>
    }
    return <PrimaryButton onClick={onClaim}>Claim Tokens</PrimaryButton>
  }

  if (!nonDuplicateTokens.length) return null
  return (
    <>
      <Header>Claim your Tokens</Header>
      <Wrapper>
        {nonDuplicateTokens.map((address, index) => (
          <TokenRow key={index} address={address} />
        ))}
        {getButton()}
      </Wrapper>
    </>
  )
}

function TokenRow({ address }: { address: string }) {
  const { chainId } = useWeb3React()
  const registrar = useRegistrarByContract(address)
  const isCollateral = useMemo(
    () => chainId && chainId in Collateral && address === Collateral[chainId],
    [address, chainId]
  )
  const collateralCurrency = useCurrency(address)

  const logoRegistrar = useCurrencyLogo(registrar?.id, registrar?.symbol)
  const logoCollateral = useCurrencyLogo(undefined, 'DEI')

  if (isCollateral) {
    return (
      <Row>
        <ImageWithFallback src={logoCollateral} width={30} height={30} alt={`Collateral Logo`} round />
        <NameWrapper>
          <div>{collateralCurrency?.symbol}</div>
        </NameWrapper>
      </Row>
    )
  }

  return (
    <Row>
      <ImageWithFallback src={logoRegistrar} width={30} height={30} alt={`${registrar?.symbol}`} round />
      <NameWrapper long={registrar?.direction === Direction.LONG}>
        <div>{registrar?.symbol}</div>
        <div>{registrar?.name}</div>
        <div>{registrar?.direction}</div>
      </NameWrapper>
    </Row>
  )
}
