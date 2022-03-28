import React, { useMemo } from 'react'
import styled, { useTheme } from 'styled-components'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import ReactTooltip from 'react-tooltip'
import { Registrar } from 'lib/synchronizer'
import { usePartnerFeeCallback, usePlatformFeeCallback } from 'lib/synchronizer/hooks'

import { TradeType } from 'state/trade/reducer'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { Direction } from 'hooks/useTradePage'
import { useIsPartner } from 'hooks/usePartnerId'

import { formatDollarAmount } from 'utils/numbers'

import { PrimaryButton } from 'components/Button'
import { IconWrapper, ChevronDown, Info } from 'components/Icons'
import TransactionConfirmationModal, { ConfirmationContent, TransactionErrorContent } from './index'
import ImageWithFallback from 'components/ImageWithFallback'

const MainWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 1.5rem 1.25rem;
  overflow: visible;
`

const BottomWrapper = styled(MainWrapper)`
  gap: 0.5rem;
`

const InputsOutputs = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.25rem;
`

const TokenRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 1.25rem;
  font-size: 1.1rem;
  background: ${({ theme }) => theme.bg1};
  padding: 0.5rem;
  border-radius: 10px;

  & > * {
    &:nth-child(2) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      font-weight: bold;
    }
  }
`

const InfoRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 5px;
  font-size: 0.8rem;
  overflow: visible;

  & > * {
    overflow: visible;
    position: relative;
    z-index: 0;
    &:last-child {
      color: ${({ theme }) => theme.text3};
    }
  }
`

const Disclaimer = styled.div`
  display: block;
  align-text: center;
  text-align: center;
  font-size: 0.7rem;
  border-radius: 5px;
  padding: 0.7rem;
`

const FeeToolTip = styled(ReactTooltip)`
  opacity: 1 !important;
  padding: 3px 7px !important;
  font-size: 0.6rem !important;
`

const FeeLabel = styled.div`
  &:hover {
    cursor: pointer;
  }
`

export default function ConfirmTrade({
  isOpen,
  onDismiss,
  onConfirm,
  attemptingTxn,
  txHash,
  expiryBlock,
  tradeErrorMessage,
  currencyIn,
  currencyOut,
  registrar,
  amountIn,
  amountOut,
  tradeType,
  direction,
}: {
  isOpen: boolean
  onDismiss: () => void
  onConfirm: () => void
  attemptingTxn: boolean
  txHash: string
  expiryBlock: number | undefined
  tradeErrorMessage?: string
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  registrar: Registrar | undefined
  amountIn: CurrencyAmount<NativeCurrency | Token> | null | undefined
  amountOut: CurrencyAmount<NativeCurrency | Token> | null | undefined
  tradeType: TradeType
  direction: Direction
}) {
  const theme = useTheme()
  const logoIn = useCurrencyLogo(tradeType === TradeType.OPEN ? undefined : registrar?.id, currencyIn?.symbol)
  const logoOut = useCurrencyLogo(tradeType === TradeType.CLOSE ? undefined : registrar?.id, currencyOut?.symbol)
  const getPlatformFee = usePlatformFeeCallback()
  const getPartnerFee = usePartnerFeeCallback()
  const isPartner = useIsPartner()

  const feeAmount: string | null = useMemo(() => {
    if (!amountIn || !amountOut || !registrar) return null
    return tradeType === TradeType.OPEN
      ? amountIn.multiply(registrar.fee).toSignificant()
      : amountOut.multiply(registrar.fee).toSignificant()
  }, [amountIn, amountOut, registrar, tradeType])

  const feeLabel = useMemo(() => {
    if (!registrar || !feeAmount) return ''
    return `${registrar.fee.toSignificant()}% / ${feeAmount} DEI`
  }, [registrar, feeAmount])

  const partnerName = useMemo(() => {
    return isPartner ? 'Partner' : 'dSynths'
  }, [isPartner])

  const feeToolTip = useMemo(() => {
    if (!registrar) return null
    const platformFee = getPlatformFee(registrar.sector).times(100)
    const partnerFee = getPartnerFee(registrar.sector).times(100)
    return `${platformFee.toString()}% DEUS DAO <br/> ${partnerFee.toString()}% ${partnerName}`
  }, [registrar, getPlatformFee, getPartnerFee, partnerName])

  const priceLabel = useMemo(() => {
    return registrar ? `${formatDollarAmount(Number(registrar.price))}$ / ${registrar.id}` : ''
  }, [registrar])

  const summary = useMemo(() => {
    if (!amountIn || !amountOut || !currencyIn || !currencyOut) return ''
    return `Trade ${amountIn.toSignificant()} ${currencyIn.symbol} for ${amountOut.toSignificant()} ${
      currencyOut.symbol
    }`
  }, [amountIn, amountOut, currencyIn, currencyOut])

  function getInputsOutputs(): JSX.Element {
    return (
      <InputsOutputs>
        {currencyIn && (
          <TokenRow>
            <ImageWithFallback src={logoIn} alt={`${currencyIn.name} Logo`} width={40} height={40} round />
            <div>{amountIn?.toSignificant()}</div>
            <div>{currencyIn.symbol}</div>
          </TokenRow>
        )}
        <IconWrapper style={{ alignSelf: 'center' }} stroke={theme.text1}>
          <ChevronDown />
        </IconWrapper>
        {currencyOut && (
          <TokenRow>
            <ImageWithFallback src={logoOut} alt={`${currencyOut.name} Logo`} width={40} height={40} round />
            <div>{amountOut?.toSignificant()}</div>
            <div>{currencyOut.symbol}</div>
          </TokenRow>
        )}
      </InputsOutputs>
    )
  }

  function getConfirmationContent() {
    return (
      <ConfirmationContent
        title="Confirm Trade"
        onDismiss={onDismiss}
        mainContent={
          <MainWrapper>
            {getInputsOutputs()}
            <InfoRow style={{ marginTop: '10px' }}>
              <div>{currencyOut?.symbol} Received: </div>
              <div>
                {amountOut?.toSignificant()} {currencyOut?.symbol}
              </div>
            </InfoRow>
            <InfoRow>
              <div>Price</div>
              <div>{priceLabel}</div>
            </InfoRow>
            <InfoRow>
              <div>Price Impact</div>
              <div>0%</div>
            </InfoRow>
            <InfoRow>
              <FeeToolTip id="fee" place="bottom" type="info" effect="solid" multiline backgroundColor="black" />
              <div>Fee: </div>
              <FeeLabel data-for="fee" data-tip={feeToolTip}>
                {feeLabel} <Info size={10} />
              </FeeLabel>
            </InfoRow>
            <InfoRow>
              <div>Trade</div>
              <div>
                {tradeType} {direction}
              </div>
            </InfoRow>
          </MainWrapper>
        }
        bottomContent={
          <BottomWrapper>
            <Disclaimer>
              Output amounts are estimated. You will spend exactly {amountIn?.toSignificant()} {currencyIn?.symbol} for
              an estimated {amountOut?.toSignificant()} {currencyOut?.symbol}.
            </Disclaimer>
            <PrimaryButton onClick={onConfirm}>Confirm</PrimaryButton>
          </BottomWrapper>
        }
      />
    )
  }

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      expiryBlock={expiryBlock}
      summary={summary}
      currencyToAdd={currencyOut}
      content={
        tradeErrorMessage ? (
          <TransactionErrorContent onDismiss={onDismiss} message={tradeErrorMessage} />
        ) : (
          getConfirmationContent()
        )
      }
    />
  )
}
