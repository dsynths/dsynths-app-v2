import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useAppDispatch } from 'state'
import styled from 'styled-components'
import { darken } from 'polished'

import useWeb3React from 'hooks/useWeb3'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useTradeCallback from 'hooks/useTradeCallback'
import useTradePage, { Direction, PrimaryError } from 'hooks/useTradePage'
import { useAssetByContract } from 'hooks/useAssetList'
import {
  setTradeState,
  setShowReview,
  setAttemptingTxn,
  TypedField,
  useTradeState,
  TradeType,
} from 'state/trade/reducer'
import useDefaultsFromURL from 'state/trade/hooks'
import { Synchronizer } from 'constants/addresses'
import { SynchronizerChains } from 'constants/chains'

import { Card } from 'components/Card'
import InputBox from './InputBox'
import { ArrowBubble, IconWrapper } from 'components/Icons'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { useWalletModalToggle } from 'state/application/hooks'
import ConfirmTradeModal from 'components/TransactionConfirmationModal/ConfirmTrade'
import { ZERO } from '@sushiswap/core-sdk'
import { dynamicPrecision } from 'utils/numbers'

const Wrapper = styled(Card)`
  justify-content: flex-start;
  overflow: visible;
  padding: 30px;
  overflow: visible;
  box-shadow: ${({ theme }) => theme.boxShadow2};
`

const DirectionWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0 10px;
  width: 100%;
  overflow: visible;
`

const DirectionTab = styled.div<{
  active?: boolean
  isLong?: boolean
  isShort?: boolean
}>`
  font-size: 15px;
  flex: 1;
  height: 35px;
  line-height: 35px;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  border-radius: ${({ isLong }) => (isLong ? '10px 0 0 10px' : '0 10px 10px 0')};
  ${({ theme, isLong, isShort, active }) =>
    isLong && active
      ? `
    background: #00D16C;
    border: 1px solid #00D16C;
    &:hover {
      background: ${darken(0.05, '#00D16C')};
      border-color: ${darken(0.05, '#00D16C')};
    };
  `
      : isShort && active
      ? `
      background: rgba(255, 0, 0, 0.5);
      border: 1px solid rgba(255, 0, 0, 0.5);
      &:hover {
        background: ${darken(0.05, 'rgba(255, 0, 0, 0.5)')};
        border-color: ${darken(0.05, 'rgba(255, 0, 0, 0.5)')};
      };    
  `
      : `
      background: rgba(206, 206, 206, 0.35);
      border: 1px solid #A9A8A8;
      color: ${theme.text2};
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
  margin-top: 30px;
  gap: 5px;
`

const ArrowWrapper = styled(IconWrapper)`
  position: absolute;
  top: calc(50% + 11px); // trial and error adjustment to account for the balancelabel
  left: 50%;
  transform: translate(-50%, -50%);

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
  margin-top: 30px;
  z-index: 0;
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
`

export default function Trade() {
  const dispatch = useAppDispatch()
  const { chainId, account } = useWeb3React()
  const {
    currencies: { baseCurrency, quoteCurrency },
    setURLCurrency,
  } = useDefaultsFromURL()
  const tradeState = useTradeState()
  const toggleWalletModal = useWalletModalToggle()

  const [tradeType, setTradeType] = useState<TradeType>(TradeType.OPEN)
  const [direction, setDirection] = useState(Direction.LONG)
  const { attemptingTxn, showReview, error: tradeStateError } = tradeState
  const [sibling, setSibling] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)

  const currencies = useMemo(() => {
    return tradeType === TradeType.OPEN ? [quoteCurrency, baseCurrency] : [baseCurrency, quoteCurrency]
  }, [tradeType, baseCurrency, quoteCurrency])

  const asset = useAssetByContract(baseCurrency?.wrapped.address ?? sibling)
  const { formattedAmounts, parsedAmounts, error } = useTradePage(
    baseCurrency,
    quoteCurrency,
    currencies,
    asset,
    tradeType
  )

  const switchCurrencies = useCallback(() => {
    setTradeType((prev) => (prev === TradeType.OPEN ? TradeType.CLOSE : TradeType.OPEN))
  }, [tradeType])

  useEffect(() => {
    if (asset) {
      setDirection(asset.direction)
      setSibling(asset.sibling)
    } else {
      setDirection(Direction.LONG)
      setSibling('')
    }
  }, [asset])

  // Allow user to connect any chain globally, but restrict unsupported ones on this page
  const isSupportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return SynchronizerChains.includes(chainId)
  }, [chainId, account])

  const spender = useMemo(() => {
    return isSupportedChainId && chainId ? Synchronizer[chainId] : undefined
  }, [chainId, isSupportedChainId])
  const [approvalState, approveCallback1] = useApproveCallback(currencies[0], spender)

  const handleSwitchDirection = useCallback(() => {
    setDirection((prev) => (prev === Direction.LONG ? Direction.SHORT : Direction.LONG))
    asset && setURLCurrency(asset.sibling)
  }, [direction, asset])

  const handleSwitchCurrencies = useCallback(() => {
    dispatch(setTradeState({ ...tradeState, typedValue: '', typedField: TypedField.A }))
    switchCurrencies()
  }, [dispatch, switchCurrencies, tradeState])

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = currencies[0] && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [currencies, approvalState])

  const marketIsOpen = useMemo(() => {
    return !!asset?.open
  }, [asset])

  const { state: tradeCallbackState, callback: tradeCallback } = useTradeCallback(
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

  const feeLabel = useMemo(() => {
    if (!asset) {
      return null
    }
    return `Fee: ${asset.fee.toFixed(2)}%`
  }, [asset])

  const priceLabel = useMemo(() => {
    if (!asset || typeof asset.price !== 'number' || asset.price == 0) {
      return null
    }
    return `Oracle Price: ${asset.price.toFixed(2)}$ / ${asset.id}`
  }, [asset, tradeType])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account || !asset || error || !marketIsOpen) {
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
    if (error === PrimaryError.ACCOUNT) {
      return <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
    }
    if (!isSupportedChainId) {
      return null
    }
    if (!asset) {
      return <PrimaryButton>Select an asset</PrimaryButton>
    }
    if (!marketIsOpen) {
      return <PrimaryButton disabled>Market is closed</PrimaryButton>
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

  return (
    <Wrapper>
      <DirectionWrapper>
        <DirectionTab isLong active={direction === Direction.LONG} onClick={handleSwitchDirection}>
          {Direction.LONG}
        </DirectionTab>
        <DirectionTab isShort active={direction === Direction.SHORT} onClick={handleSwitchDirection}>
          {Direction.SHORT}
        </DirectionTab>
      </DirectionWrapper>
      <InputWrapper>
        <InputBox
          currency={currencies[0]}
          value={formattedAmounts[0]}
          showBalance
          showMax
          showSelect={currencies[0]?.wrapped.address.toLowerCase() === asset?.contract.toLowerCase()}
          onChange={(value) =>
            dispatch(setTradeState({ ...tradeState, typedValue: value || '', typedField: TypedField.A }))
          }
          onSelect={(currency) => setURLCurrency(currency)}
        />
        <ArrowWrapper size="25px" onClick={handleSwitchCurrencies}>
          <ArrowBubble size={25} style={{ transform: 'rotate(90deg)' }} />
        </ArrowWrapper>
        <InputBox
          currency={currencies[1]}
          value={formattedAmounts[1]}
          showSelect={currencies[1]?.wrapped.address.toLowerCase() === asset?.contract.toLowerCase()}
          onChange={(value) =>
            dispatch(setTradeState({ ...tradeState, typedValue: value || '', typedField: TypedField.B }))
          }
          onSelect={(currency) => setURLCurrency(currency)}
        />
      </InputWrapper>
      {marketIsOpen && (
        <FeeWrapper>
          <div>{feeLabel}</div>
          <div>{priceLabel}</div>
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
        asset={asset}
        amountIn={parsedAmounts[0]}
        amountOut={parsedAmounts[1]}
        tradeType={tradeType}
        direction={direction}
      />
    </Wrapper>
  )
}
