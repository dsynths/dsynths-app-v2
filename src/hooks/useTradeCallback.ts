import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigintIsh, JSBI, Currency, CurrencyAmount, NativeCurrency, Token, ZERO } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { useSynchronizerContract, useSynchronizerV2Contract } from './useContract'
import useSynchronizer from './useSynchronizer'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TradeType } from 'state/trade/reducer'
import { MuonClient, MUON_NETWORK_NAMES } from 'constants/oracle'
import { calculateGasMargin } from 'utils/web3'

export enum TradeCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

interface MuonResponse {
  success?: boolean
  app: string
  cid: string
  confirmed: boolean
  confirmedAt: number
  data: {
    init: {
      none: string
      nonceAddress: string
      party: string
    }
    params: {
      action: number
      chain: string
      tokenId: string
    }
    result: {
      action: number
      address: string
      blockNumber: number
      chain: string
      fee: number
      price: string
    }
  }
  method: string
  nSign: number
  owner: string
  peerId: string
  reqId: string
  signatures: {
    owner: string
    ownerPubKey: {
      x: string
      yParity: string
    }
    result: {
      action: number
      address: string
      blockNumber: number
      chain: string
      fee: number
      price: string
    }
    signature: string
    timestamp: number
  }[]
  sigs: Array<{
    nonce: string
    owner: string
    signature: string
  }>
  startedAt: number
  _id: string
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
  const SynchronizerV2 = useSynchronizerV2Contract()

  const address = useMemo(() => {
    const contract = tradeType === TradeType.OPEN ? currencyB : currencyA
    return contract?.wrapped.address ?? ''
  }, [currencyA, currencyB, tradeType])

  const addressV2 = useMemo(() => {
    const contract = tradeType === TradeType.OPEN ? currencyB : currencyA
    return contract?.wrapped.address ?? ''
  }, [currencyA, currencyB, tradeType])

  const { isProxyTrade, isV2Trade, fetchSignatures, sortSignatures } = useSynchronizer(address, tradeType)

  const constructV1Call = useCallback(async () => {
    try {
      if (!account || !address || !Synchronizer || !amountA || !amountB) {
        throw new Error('Missing dependencies.')
      }

      const signatures = await fetchSignatures()
      const { price, data } = sortSignatures(signatures)

      const signsMethod = tradeType === TradeType.OPEN ? 'buy' : 'sell'
      const blockNosMapping = data.map((node) => node.blockNo.toString())
      const priceMapping = data.map((node) => node.price)
      const vMapping = data.map((node) => node.signs[signsMethod].v.toString())
      const rMapping = data.map((node) => node.signs[signsMethod].r.toString())
      const sMapping = data.map((node) => node.signs[signsMethod].s.toString())

      const args = {
        _user: account,
        multiplier: data[0].multiplier.toString(),
        registrar: address,
        amount: tradeType === TradeType.OPEN ? toHex(amountB.quotient) : toHex(amountA.quotient),
        fee: data[0].fee.toString(),
        blockNos: blockNosMapping,
        prices: priceMapping,
        v: vMapping,
        r: rMapping,
        s: sMapping,
      }

      const methodName =
        tradeType === TradeType.OPEN ? (isProxyTrade ? 'buy' : 'buyFor') : isProxyTrade ? 'sell' : 'sellFor'

      const value = isProxyTrade ? await Synchronizer.calculateXdaiAmount(price, args.fee, args.amount) : 0

      return {
        address: Synchronizer.address,
        calldata: Synchronizer.interface.encodeFunctionData(methodName, Object.values(args)) ?? '',
        value,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [fetchSignatures, sortSignatures, isProxyTrade, tradeType, account, address, Synchronizer, amountA, amountB])

  const constructV2Call = useCallback(async () => {
    try {
      if (!account || !chainId || !(chainId in MUON_NETWORK_NAMES) || !addressV2 || !amountA || !SynchronizerV2) {
        throw new Error('Missing dependencies.')
      }

      const action = tradeType === TradeType.OPEN ? 'open' : 'close'

      const response: MuonResponse = await MuonClient.app('synchronizer')
        .method('signature', {
          tokenId: addressV2,
          action: action,
          chain: MUON_NETWORK_NAMES[chainId],
        })
        .call()

      console.log('Test test @ muon devs!')
      console.log('Using Muon app: ', 'synchronizer')
      console.log('Using Client : ', MuonClient)
      console.log('With method: ', 'signature')
      console.log('Trading tokenAddresss: ', addressV2)
      console.log('Using action: ', action)
      console.log('On chain: ', chainId)
      console.log('With chainName: ', MUON_NETWORK_NAMES[chainId])
      console.log('Called Muon.....')
      console.log('The response: ', response)

      if (response.success === false) {
        throw new Error('Unable to fetch Muon signatures. Please try again later.')
      }

      const args = {
        partnerID: account,
        _user: account,
        registrar: addressV2,
        amountIn: toHex(amountA.quotient),
        expireBlock: response.data.result.blockNumber,
        price: response.data.result.price.toString(),
        _reqId: response.reqId,
        sigs: response.sigs,
      }

      const methodName = tradeType === TradeType.OPEN ? 'buyFor' : 'sellFor'

      console.log('Contract arguments: ', args)

      return {
        address: SynchronizerV2.address,
        calldata: SynchronizerV2.interface.encodeFunctionData(methodName, Object.values(args)) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [chainId, account, addressV2, amountA, SynchronizerV2, tradeType])

  return useMemo(() => {
    if (!account || !chainId || !library || (!Synchronizer && !SynchronizerV2) || !currencyA || !currencyB) {
      return {
        state: TradeCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (amountA?.equalTo(ZERO)) {
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
        const call = isV2Trade ? await constructV2Call() : await constructV1Call()
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
  }, [
    account,
    chainId,
    library,
    addTransaction,
    isV2Trade,
    constructV1Call,
    constructV2Call,
    Synchronizer,
    amountA,
    amountB,
    currencyA,
    currencyB,
  ])
}
