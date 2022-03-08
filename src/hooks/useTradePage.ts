import { useMemo } from 'react'
import { JSBI, Currency, CurrencyAmount, ZERO, Price } from '@sushiswap/core-sdk'
import { parseUnits } from '@ethersproject/units'
import { Registrar } from 'lib/synchronizer'

import useWeb3React from './useWeb3'
import { useTradeState, TypedField, TradeType } from 'state/trade/reducer'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { maxAmountSpend } from 'utils/currency'
import { tryParseAmount } from 'utils/parse'
import { ONE_HUNDRED_PERCENT } from 'utils/prices'

export enum PrimaryError {
  ACCOUNT = 'ACCOUNT',
  BALANCE = 'BALANCE',
  AMOUNT = 'AMOUNT',
  VALID = 'VALID',
}

export enum Direction {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export default function useTradePage(
  baseCurrency: Currency | undefined,
  quoteCurrency: Currency | undefined,
  currencies: (Currency | undefined)[],
  registrar: Registrar | undefined,
  tradeType: TradeType
) {
  const { chainId, account } = useWeb3React()
  const { typedValue, typedField } = useTradeState()
  const balance = useCurrencyBalance(account ?? undefined, currencies[0])

  // Amount typed in either input or output fields
  const typedAmount = useMemo(() => {
    return tryParseAmount(typedValue, typedField === TypedField.A ? currencies[0] : currencies[1])
  }, [currencies, typedValue, typedField])

  const price = useMemo(() => {
    if (!registrar || !parseFloat(registrar.price) || !baseCurrency || !quoteCurrency) return undefined
    const fixedPrice = parseFloat(registrar.price).toFixed(quoteCurrency.decimals)

    const base = CurrencyAmount.fromRawAmount(
      baseCurrency,
      JSBI.BigInt(parseUnits('1', baseCurrency.decimals).toString())
    )
    const quote = CurrencyAmount.fromRawAmount(
      quoteCurrency,
      JSBI.BigInt(parseUnits(fixedPrice, quoteCurrency.decimals).toString())
    )
    return new Price({ baseAmount: base, quoteAmount: quote })
  }, [registrar, baseCurrency, quoteCurrency])

  // Computed counter amount by typedAmount and its corresponding price
  const computedAmount = useMemo(() => {
    if (!typedAmount || !price || !registrar) return undefined
    const fee = registrar.fee

    // inputfield
    if (typedField === TypedField.A && tradeType === TradeType.OPEN) {
      const feeAmount = typedAmount.multiply(fee)
      const collateralAmount = typedAmount.subtract(feeAmount)
      return price.invert().quote(collateralAmount)
    }

    if (typedField === TypedField.A && tradeType === TradeType.CLOSE) {
      const collateralAmount = price.quote(typedAmount)
      const feeAmount = collateralAmount.multiply(fee)
      return collateralAmount.subtract(feeAmount)
    }

    // outputfield
    if (tradeType === TradeType.OPEN) {
      return price.quote(typedAmount).divide(ONE_HUNDRED_PERCENT.subtract(fee))
    }
    if (tradeType === TradeType.CLOSE) {
      return price.invert().quote(typedAmount).divide(ONE_HUNDRED_PERCENT.subtract(fee))
    }
  }, [typedAmount, typedField, tradeType, price, registrar])

  const parsedAmounts = useMemo(() => {
    return [
      typedField === TypedField.A ? typedAmount : computedAmount,
      typedField === TypedField.A ? computedAmount : typedAmount,
    ]
  }, [typedField, typedAmount, computedAmount])

  // Stringified values purely for user display
  const formattedAmounts = useMemo(() => {
    return [
      typedField === TypedField.A ? typedValue : computedAmount?.toSignificant(9) ?? '',
      typedField === TypedField.B ? typedValue : computedAmount?.toSignificant(9) ?? '',
    ]
  }, [typedField, typedValue, computedAmount])

  const error = useMemo(
    () =>
      !account || !chainId
        ? PrimaryError.ACCOUNT
        : parsedAmounts[0]?.equalTo(ZERO)
        ? PrimaryError.AMOUNT
        : balance && parsedAmounts[0] && maxAmountSpend(balance)?.lessThan(parsedAmounts[0])
        ? PrimaryError.BALANCE
        : PrimaryError.VALID,
    [account, chainId, balance, parsedAmounts]
  )

  return useMemo(
    () => ({
      error,
      formattedAmounts,
      parsedAmounts,
    }),
    [error, formattedAmounts, parsedAmounts]
  )
}
