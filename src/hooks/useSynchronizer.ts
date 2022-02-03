import { useCallback, useMemo } from 'react'

import useWeb3React from './useWeb3'
import { TradeType } from 'state/trade/reducer'
import { ProxyChains, SynchronizerV2Chains } from 'constants/chains'
import { Signature, Signatures } from 'state/signatures/reducer'

import { ORACLE_BASE_URL_MAP, ORACLE_NETWORK_NAMES } from 'constants/oracle'
import { makeHttpRequest } from 'utils/http'
import { Currency } from '@sushiswap/core-sdk'
import { getAddress } from '@ethersproject/address'

const minimumSignatures = 1
const expectedSignatures = ORACLE_BASE_URL_MAP.length

function comparePrice(a: Signature, b: Signature) {
  const A = Number(a.price)
  const B = Number(b.price)

  return A > B ? -1 : 1
}

function compareOrder(a: Signature, b: Signature) {
  const A = a.index
  const B = b.index

  return A > B ? 1 : -1
}

export default function useSynchronizer(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  tradeType: TradeType
): {
  checksummedAddress: string | undefined
  isProxyTrade: boolean
  isV2Trade: boolean
  fetchSignatures: () => Promise<Signatures[]>
  sortSignatures: (signatures: Signatures[]) => { price: string | null; data: Signature[] }
} {
  const { chainId } = useWeb3React()

  const isProxyTrade = useMemo(() => !!(chainId && ProxyChains.includes(chainId)), [chainId])
  const isV2Trade = useMemo(() => !!(chainId && SynchronizerV2Chains.includes(chainId)), [chainId])

  const checksummedAddress = useMemo(() => {
    if (!currencyA || !currencyB) {
      return undefined
    }
    return tradeType === TradeType.OPEN ? getAddress(currencyB.wrapped.address) : getAddress(currencyA.wrapped.address)
  }, [currencyA, currencyB, tradeType])

  const signatureRequest = useCallback(
    async (baseURL) => {
      try {
        if (!chainId) throw new Error('No chainId present')
        const networkName = ORACLE_NETWORK_NAMES[chainId]
        if (!networkName) throw new Error(`ChainId ${chainId} is not supported by the oracle`)

        const { href: url } = new URL(`/${networkName}/signatures.json`, baseURL)
        return makeHttpRequest(url)
      } catch (err) {
        throw err
      }
    },
    [chainId]
  )

  const fetchSignatures = useCallback(async () => {
    try {
      const responses = await Promise.allSettled(ORACLE_BASE_URL_MAP.map((url) => signatureRequest(url)))
      const signatures = responses.map((response) => {
        if (response.status !== 'fulfilled') {
          throw new Error(`response.status returns unfulfilled: ${response}`)
        }
        return response.value as Signatures
      })
      return signatures
    } catch (err) {
      throw err
    }
  }, [signatureRequest])

  const sortSignatures = useCallback(
    (signaturesPerNode: Signatures[]) => {
      try {
        if (!checksummedAddress) {
          throw new Error('Currency is undefined')
        }

        const priceFeed: Signature[] = []

        for (let i = 0; i < signaturesPerNode.length; i++) {
          const node = signaturesPerNode[i]

          if (checksummedAddress in node) {
            node[checksummedAddress]['index'] = i
            priceFeed.push(node[checksummedAddress])
          }
        }

        if (priceFeed.length < minimumSignatures) {
          throw new Error('NOT ENOUGH ORACLE SIGNATURES: For security reasons, we cannot execute this trade right now.')
        }

        if (tradeType === TradeType.OPEN) {
          const result = priceFeed.sort(comparePrice)
          return {
            price: result[0].price,
            data: result.slice(0, expectedSignatures).sort(compareOrder),
          }
        } else {
          return {
            price: null,
            data: priceFeed.sort(comparePrice).reverse().slice(0, expectedSignatures).sort(compareOrder),
          }
        }
      } catch (err) {
        throw err
      }
    },
    [checksummedAddress, tradeType]
  )

  return {
    checksummedAddress,
    isProxyTrade,
    isV2Trade,
    fetchSignatures,
    sortSignatures,
  }
}
