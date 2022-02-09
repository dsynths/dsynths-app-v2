import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigintIsh, JSBI, Currency, CurrencyAmount, NativeCurrency, Token, ZERO } from '@sushiswap/core-sdk'
import { getAddress } from '@ethersproject/address'

import useWeb3React from './useWeb3'
import { useSynchronizerContract } from './useContract'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TradeType } from 'state/trade/reducer'
import { MuonClient, MUON_NETWORK_NAMES, MuonResponse } from 'constants/oracle'
import { calculateGasMargin } from 'utils/web3'

export enum TradeCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export function toHex(bigintIsh: BigintIsh) {
  const bigInt = JSBI.BigInt(bigintIsh)
  let hex = bigInt.toString(16)
  if (hex.length % 2 !== 0) {
    hex = `0${hex}`
  }
  return `0x${hex}`
}

export default function useTradeCallback(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  amountA: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  amountB: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  tradeType: TradeType
): {
  state: TradeCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { chainId, account, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const Synchronizer = useSynchronizerContract()

  const address = useMemo(() => {
    if (!currencyA || !currencyB) {
      return undefined
    }
    return tradeType === TradeType.OPEN ? getAddress(currencyB.wrapped.address) : getAddress(currencyA.wrapped.address)
  }, [currencyA, currencyB, tradeType])

  const constructCall = useCallback(async () => {
    try {
      if (!account || !chainId || !(chainId in MUON_NETWORK_NAMES) || !address || !amountA || !Synchronizer) {
        throw new Error('Missing dependencies.')
      }

      const action = tradeType === TradeType.OPEN ? 'buy' : 'sell'

      const response: MuonResponse = await MuonClient.app('synchronizer')
        .method('signature', {
          tokenId: address,
          action,
          chain: MUON_NETWORK_NAMES[chainId],
          useMultiplier: false,
        })
        .call()

      console.log('Muon request: ', {
        tokenId: address,
        action,
        chain: MUON_NETWORK_NAMES[chainId],
        useMultiplier: false,
      })
      console.log('Muon response: ', response)

      if (response.success === false) {
        throw new Error('Unable to fetch Muon signatures. Please try again later.')
      }

      const args = {
        partnerID: '0x1164fe7a76D22EAA66f6A0aDcE3E3a30d9957A5f', // TODO fix this
        _user: account,
        registrar: address,
        amountIn: toHex(amountA.quotient),
        expireBlock: response.data.result.expireBlock,
        price: response.data.result.price,
        _reqId: response.reqId,
        sigs: response.sigs,
      }

      const methodName = tradeType === TradeType.OPEN ? 'buyFor' : 'sellFor'

      console.log('Contract arguments: ', args)

      return {
        address: Synchronizer.address,
        calldata: Synchronizer.interface.encodeFunctionData(methodName, Object.values(args)) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [chainId, account, address, amountA, Synchronizer, tradeType])

  return useMemo(() => {
    if (!account || !chainId || !library || !Synchronizer || !currencyA || !currencyB) {
      return {
        state: TradeCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!amountA || amountA.equalTo(ZERO)) {
      return {
        state: TradeCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }
    return {
      state: TradeCallbackState.VALID,
      error: null,
      callback: async function onTrade(): Promise<string> {
        console.log('onTrade callback')
        const call = await constructCall()
        const { address, calldata, value } = call

        if ('error' in call) {
          console.error(call.error)
          if (call.error.message) {
            throw new Error(call.error.message)
          } else {
            throw new Error('Unexpected error. Could not construct calldata.')
          }
        }

        const tx = !value
          ? { from: account, to: address, data: calldata }
          : { from: account, to: address, data: calldata, value }

        console.log('TRADE TRANSACTION', { tx, value })

        const estimatedGas = await library.estimateGas(tx).catch((gasError) => {
          console.debug('Gas estimate failed, trying eth_call to extract error', call)

          return library
            .call(tx)
            .then((result) => {
              console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
              return {
                error: new Error('Unexpected issue with estimating the gas. Please try again.'),
              }
            })
            .catch((callError) => {
              console.debug('Call threw an error', call, callError)
              return {
                error: new Error(callError.message), // TODO make this human readable
              }
            })
        })

        if ('error' in estimatedGas) {
          throw new Error('Unexpected error. Could not estimate gas for this transaction.')
        }

        return library
          .getSigner()
          .sendTransaction({
            ...tx,
            ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
            // gasPrice /// TODO add gasPrice based on EIP 1559
          })
          .then((response: TransactionResponse) => {
            console.log(response)

            const summary = `Trade ${amountA?.toSignificant()} ${currencyA.symbol} for ${amountB?.toSignificant()} ${
              currencyB.symbol
            }`
            addTransaction(response, { summary })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Transaction failed`, error, address, calldata, value)
              throw new Error(`Transaction failed: ${error.message}`) // TODO make this human readable, see: https://github.com/sushiswap/sushiswap-interface/blob/2082b7ded0162324e83aeffad261cc511441f00e/src/hooks/useSwapCallback.ts#L470
            }
          })
      },
    }
  }, [account, chainId, library, addTransaction, constructCall, Synchronizer, amountA, amountB, currencyA, currencyB])
}
