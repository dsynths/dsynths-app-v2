import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useAppDispatch } from 'state'
import styled from 'styled-components'
import { ZERO } from '@sushiswap/core-sdk'
import { TrendingDown, TrendingUp } from 'react-feather'

import { useIsJadeTheme } from 'hooks/useTheme'
import useWeb3React from 'hooks/useWeb3'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useTradeCallback from 'hooks/useTradeCallback'
import useTradePage, { Direction, PrimaryError } from 'hooks/useTradePage'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'

import {
  setTradeState,
  setShowReview,
  setAttemptingTxn,
  TypedField,
  useTradeState,
  TradeType,
} from 'state/trade/reducer'
import useDefaultsFromURL from 'state/trade/hooks'
import { useNetworkModalToggle, useWalletModalToggle } from 'state/application/hooks'

import { Synchronizer } from 'constants/addresses'
import { FALLBACK_CHAIN_ID, SynchronizerChains } from 'constants/chains'
import { formatDollarAmount } from 'utils/numbers'

import InputBox from './InputBox'
import { Card } from 'components/Card'
import { ArrowBubble, Network, Info } from 'components/Icons'
import { BaseButton, PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import ConfirmTradeModal from 'components/TransactionConfirmationModal/ConfirmTrade'
import { ExternalLink } from 'components/Link'
import { useRegistrarByContract } from 'lib/synchronizer/hooks'

const Wrapper = styled(Card)<{
  border?: boolean
}>`
  justify-content: flex-start;
  padding: 1.5rem;
  overflow: visible;
  box-shadow: ${({ theme }) => theme.boxShadow2};
  border: 1px solid ${({ theme, border }) => (border ? theme.border2 : 'transparent')};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `}
`

const SwitchBlock = styled(Wrapper)`
  justify-content: space-between;
  gap: 20px;

  & > p {
    text-align: center;
    font-size: 1.1rem;
    padding: 0px 30px;
  }
`

const DirectionWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  overflow: visible;
`

const DirectionTab = styled.div<{
  active: boolean
  isLong: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  gap: 5px;
  flex: 1;
  height: 35px;
  line-height: 35px;
  text-align: center;
  border-radius: ${({ isLong }) => (isLong ? '10px 0 0 10px' : '0 10px 10px 0')};
  background: ${({ theme }) => theme.primary1};
  border: 1px solid ${({ theme }) => theme.primary1};

  ${({ theme, active, isLong }) =>
    active
      ? `
      &:hover {
        background: ${theme.primary2};
        border-color: ${theme.primary2};
      };
    `
      : `
      background: rgba(206, 206, 206, 0.35);
      border: 1px solid #A9A8A8;
      ${isLong && `border-right: none`};
      ${!isLong && `border-left: none`};
    `};

  &:hover {
    cursor: pointer;
  }
`

const InputWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  justify-content: flex-start;
  width: 100%;
  margin-top: 2.5rem;
  gap: 5px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 1.5rem;
  `}
`

const ArrowWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 0px;
  overflow: visible;
  margin: 0 auto;
  z-index: 1;

  &:hover {
    cursor: pointer;
  }
`

const ButtonRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  overflow: visible;
  margin-top: 2rem;
  z-index: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 1rem;
  `}
`

const FeeWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  font-size: 0.6rem;
  color: ${({ theme }) => theme.text2};
  align-items: center;
  width: 100%;
  margin-top: 20px;
  height: 15px; // prevents short premium jumping

  & > * {
    &:last-child {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      gap: 5px;
    }
  }
`

const LabelButton = styled(BaseButton)`
  gap: 2px;
  padding: 1px 4px;
  font-size: 0.6rem;
  color: white;
  background: ${({ theme }) => theme.red3};
  border-radius: 4px;
  font-weight: normal;
  opacity: 0.7;
  &:hover {
    opacity: 0.8;
  }
`

export default function Trade() {
  const dispatch = useAppDispatch()
  const { chainId, account } = useWeb3React()
  const isJadeTheme = useIsJadeTheme()
  const {
    currencies: { baseCurrency, quoteCurrency },
    setURLCurrency,
  } = useDefaultsFromURL()
  const tradeState = useTradeState()
  const toggleWalletModal = useWalletModalToggle()
  const toggleNetworkModal = useNetworkModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const [tradeType, setTradeType] = useState<TradeType>(TradeType.OPEN)
  const [direction, setDirection] = useState(Direction.LONG)
  const { attemptingTxn, showReview, error: tradeStateError } = tradeState
  const [txHash, setTxHash] = useState<string>('')
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)

  const currencies = useMemo(() => {
    return tradeType === TradeType.OPEN ? [quoteCurrency, baseCurrency] : [baseCurrency, quoteCurrency]
  }, [tradeType, baseCurrency, quoteCurrency])

  const registrar = useRegistrarByContract(baseCurrency?.wrapped.address ?? '')

  const { formattedAmounts, parsedAmounts, error } = useTradePage(
    baseCurrency,
    quoteCurrency,
    currencies,
    registrar,
    tradeType
  )

  // Allow user to connect any chain globally, but restrict unsupported ones on this page
  const isSupportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return SynchronizerChains.includes(chainId)
  }, [chainId, account])

  const spender = useMemo(() => {
    if (!isSupportedChainId || !chainId) {
      return undefined
    }
    return Synchronizer[chainId]
  }, [chainId, isSupportedChainId])

  const [approvalState, approveCallback1] = useApproveCallback(currencies[0], spender)

  const handleSwitchDirection = useCallback(
    (newDirection) => {
      if (newDirection === direction) return
      setDirection(newDirection)
      registrar && setURLCurrency(registrar.sibling)
    },
    [registrar, setURLCurrency, direction]
  )

  useEffect(() => {
    if (registrar && registrar.direction !== direction) {
      setDirection(registrar.direction)
    }
  }, [registrar, direction])

  const handleSwitchCurrencies = useCallback(() => {
    dispatch(setTradeState({ ...tradeState, typedValue: '', typedField: TypedField.A }))
    setTradeType((prev) => (prev === TradeType.OPEN ? TradeType.CLOSE : TradeType.OPEN))
  }, [dispatch, tradeState])

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = currencies[0] && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [currencies, approvalState])

  const marketIsOpen = useMemo(() => {
    return !!registrar?.open
  }, [registrar])

  const { callback: tradeCallback } = useTradeCallback(
    currencies[0],
    currencies[1],
    parsedAmounts[0],
    parsedAmounts[1],
    tradeType
  )

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback1()
    setAwaitingApproveConfirmation(false)
  }

  const onTrade = useCallback(() => {
    if (parsedAmounts[0]?.greaterThan(ZERO) && parsedAmounts[1]?.greaterThan(ZERO)) {
      dispatch(setShowReview(true))
    }
  }, [dispatch, parsedAmounts])

  const handleTrade = useCallback(async () => {
    if (!tradeCallback) return
    dispatch(setAttemptingTxn(true))

    let error = ''
    try {
      const txHash = await tradeCallback()
      setTxHash(txHash)
    } catch (e) {
      if (e instanceof Error) {
        error = e.message
      } else {
        console.error(e)
        error = 'An unknown error occured.'
      }
    }

    dispatch(setTradeState({ ...tradeState, error, attemptingTxn: false }))
  }, [tradeCallback, dispatch, tradeState])

  const handleOnDismiss = useCallback(() => {
    setTxHash('')
    dispatch(setTradeState({ ...tradeState, showReview: false, attemptingTxn: false, error: undefined }))
  }, [dispatch, tradeState])

  const showSelectIn = useMemo(() => {
    // checking this else undefined === undefined returns true
    if (!currencies[0] || !registrar) {
      return false
    }
    return currencies[0].wrapped.address.toLowerCase() === registrar.contract.toLowerCase()
  }, [registrar, currencies])

  const showOverlay: boolean = useMemo(() => {
    if (!chainId) return false
    return !SynchronizerChains.includes(chainId)
  }, [chainId])

  const showSelectOut = useMemo(() => {
    // we don't need to check for undefined because we allow that to be true
    return currencies[1]?.wrapped.address.toLowerCase() === registrar?.contract.toLowerCase()
  }, [registrar, currencies])

  const feeLabel = useMemo(() => {
    if (!registrar) {
      return null
    }
    return `Fee: ${registrar.fee.toFixed(2)}%`
  }, [registrar])

  const priceLabel = useMemo(() => {
    return registrar ? `Oracle Price: ${formatDollarAmount(Number(registrar.price))}$ / ${registrar.id}` : ''
  }, [registrar])

  function getApproveButton(): JSX.Element | null {
    if (
      !isSupportedChainId ||
      !account ||
      !registrar ||
      error !== PrimaryError.VALID ||
      !marketIsOpen ||
      !formattedAmounts[0]
    ) {
      return null
    }

    if (awaitingApproveConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApproveLoader) {
      return (
        <PrimaryButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApprove) {
      return <PrimaryButton onClick={handleApprove}>Allow dSynths to spend your {currencies[0]?.symbol}</PrimaryButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!!getApproveButton()) {
      return null
    }
    if (!marketIsOpen) {
      return <PrimaryButton disabled>Market is closed</PrimaryButton>
    }
    if (error === PrimaryError.ACCOUNT) {
      return <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
    }
    if (!isSupportedChainId) {
      return <PrimaryButton onClick={toggleNetworkModal}>Switch to a supported chain</PrimaryButton>
    }
    if (!registrar) {
      return <PrimaryButton>Select an asset</PrimaryButton>
    }

    if (error === PrimaryError.BALANCE) {
      return <PrimaryButton disabled>Insufficient {currencies[0]?.symbol} Balance</PrimaryButton>
    }
    return (
      <PrimaryButton onClick={onTrade}>
        {tradeType} {direction}
      </PrimaryButton>
    )
  }

  function getMainContent(): JSX.Element {
    return (
      <>
        <DirectionWrapper>
          <DirectionTab
            isLong
            active={direction === Direction.LONG}
            onClick={() => direction === Direction.SHORT && handleSwitchDirection(Direction.LONG)}
          >
            {Direction.LONG}
            <TrendingUp size={14} />
          </DirectionTab>
          <DirectionTab
            isLong={false}
            active={direction === Direction.SHORT}
            onClick={() => direction === Direction.LONG && handleSwitchDirection(Direction.SHORT)}
          >
            {Direction.SHORT}
            <TrendingDown size={14} />
          </DirectionTab>
        </DirectionWrapper>
        <InputWrapper>
          <InputBox
            currency={currencies[0]}
            value={formattedAmounts[0]}
            showMax
            showSelect={showSelectIn}
            onChange={(value) =>
              dispatch(setTradeState({ ...tradeState, typedValue: value || '', typedField: TypedField.A }))
            }
          />
          <ArrowWrapper onClick={handleSwitchCurrencies}>
            <ArrowBubble size={30} />
          </ArrowWrapper>
          <InputBox
            currency={currencies[1]}
            value={formattedAmounts[1]}
            showSelect={showSelectOut}
            onChange={(value) =>
              dispatch(setTradeState({ ...tradeState, typedValue: value || '', typedField: TypedField.B }))
            }
          />
        </InputWrapper>
      </>
    )
  }

  if (showOverlay) {
    return (
      <SwitchBlock border={isJadeTheme}>
        <Network size={30} style={{ margin: '10px auto' }} />
        <p>
          You are connected to a chain that we don&apos;t support. Please connect to the Fantom network in order to
          trade.
        </p>
        <PrimaryButton onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>Switch to Fantom Mainnet</PrimaryButton>
      </SwitchBlock>
    )
  }

  return (
    <Wrapper border={isJadeTheme}>
      {getMainContent()}
      {marketIsOpen && (
        <FeeWrapper>
          <div>{feeLabel}</div>
          <div>
            {direction === Direction.SHORT && (
              <ExternalLink href="https://docs.deus.finance/synchronizer/short-premium">
                <LabelButton>
                  Short Premium <Info size={8} />
                </LabelButton>
              </ExternalLink>
            )}
            {priceLabel}
          </div>
        </FeeWrapper>
      )}
      <ButtonRow>
        {getApproveButton()}
        {getActionButton()}
      </ButtonRow>
      <ConfirmTradeModal
        isOpen={showReview}
        onDismiss={handleOnDismiss}
        onConfirm={handleTrade}
        attemptingTxn={attemptingTxn}
        tradeErrorMessage={tradeStateError}
        txHash={txHash}
        currencyIn={currencies[0]}
        currencyOut={currencies[1]}
        registrar={registrar}
        amountIn={parsedAmounts[0]}
        amountOut={parsedAmounts[1]}
        tradeType={tradeType}
        direction={direction}
      />
    </Wrapper>
  )
}
