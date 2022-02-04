import { useMemo } from 'react'
import { Percent, Token } from '@sushiswap/core-sdk'
import find from 'lodash/find'

import useWeb3React from 'hooks/useWeb3'
import { useQuotesState } from 'state/quotes/reducer'
import { useConductedState } from 'state/conducted/reducer'
import { useSignaturesState } from 'state/signatures/reducer'
import { Sector, useDetailsState } from 'state/details/reducer'
import { Direction } from './useTradePage'
import { SupportedChainId } from 'constants/chains'
import { getAddress } from '@ethersproject/address'

/**
 * @param id Identifier according to the oracle
 * @param ticker official ticker, usually same as id
 * @param symbol symbol as per the direction (long or short)
 * @param name contract name as per mint constructor
 * @param sector crypto or stock
 * @param direction direction (long or short)
 * @param contract the contract address
 * @param sibling contract address of the asset in opposite direction
 * @param price latest quote provided by the oracle
 * @param fee latest fee provided by the oracle
 * @param open if asset is tradeable
 */
export interface SubAsset {
  id: string
  chainId: SupportedChainId
  ticker: string
  symbol: string
  name: string
  sector: Sector
  direction: Direction
  contract: string
  sibling: string
  price: string
  fee: Percent
  open: boolean
  token: Token
}

export interface Asset {
  id: string
  long: SubAsset
  short: SubAsset
}

export interface TokenMap {
  [contract: string]: Token
}

// https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false
  const testDummy: TValue = value
  return true
}

function sortAlphabetically(x: SubAsset, y: SubAsset) {
  if (x.ticker < y.ticker) {
    return -1
  }
  if (x.ticker > y.ticker) {
    return 1
  }
  return 0
}

/**
 * A list of all conducted tokens supported by DEUS, where longs/shorts are considered siblings.
 */
export function useAssetList(targetChainId?: SupportedChainId): Asset[] {
  const { chainId: connectedChainId } = useWeb3React()
  const { conducted } = useConductedState()
  const { quotes } = useQuotesState()
  const { signatures } = useSignaturesState()
  const { details } = useDetailsState()

  const chainId = useMemo(() => {
    return targetChainId ?? connectedChainId
  }, [targetChainId, connectedChainId])

  return useMemo(() => {
    if (!chainId || !conducted[chainId] || !quotes[chainId] || !signatures[chainId] || !details) return []

    return conducted[chainId]
      .map(({ id, long, short }) => {
        const quote = quotes[chainId][id]
        const longSigs = signatures[chainId][long]
        const shortSigs = signatures[chainId][short]
        const asset = details[id]

        if (!asset || !quote || !quote.long || !quote.short) {
          return null
        }

        const longAsset: SubAsset = {
          id,
          chainId,
          ticker: asset.symbol,
          name: asset.name,
          sector: asset.sector,
          direction: Direction.LONG,
          contract: getAddress(long),
          sibling: short,
          symbol: asset.longSymbol,
          price: quote.long.price,
          fee: quote.long.fee,
          open: !!longSigs,
          token: new Token(chainId, getAddress(long), 18, asset.symbol, asset.name),
        }

        const shortAsset: SubAsset = {
          id,
          chainId,
          ticker: asset.symbol,
          name: asset.name,
          sector: asset.sector,
          direction: Direction.SHORT,
          contract: getAddress(short),
          sibling: long,
          symbol: asset.shortSymbol,
          price: quote.short.price,
          fee: quote.short.fee,
          open: !!shortSigs,
          token: new Token(chainId, getAddress(short), 18, asset.symbol, asset.name),
        }

        return {
          id,
          long: longAsset,
          short: shortAsset,
        }
      })
      .filter(notEmpty)
  }, [chainId, details, conducted, quotes, signatures])
}

/**
 * A list of all conducted tokens supported by DEUS, where longs/shorts are returned individually.
 */
export function useSubAssetList(targetChainId?: SupportedChainId) {
  const assetList = useAssetList(targetChainId)
  return useMemo(() => {
    return assetList.reduce((acc: SubAsset[], asset: Asset) => {
      acc.push(...[asset.long, asset.short])
      return acc
    }, [])
  }, [assetList])
}

/**
 * SubAsset list but only long tokens
 */
export function useLongAssetsList(targetChainId?: SupportedChainId) {
  const assetList = useAssetList(targetChainId)
  return useMemo(() => assetList.map((asset) => asset.long).sort(sortAlphabetically), [assetList])
}

export function useAssetByContract(contract: string | undefined) {
  const subAssetList = useSubAssetList()
  return useMemo(() => {
    if (!contract) return undefined
    const asset: SubAsset | undefined = find(
      subAssetList,
      (obj) => obj.contract.toUpperCase() == contract.toUpperCase()
    )
    return asset ?? undefined
  }, [contract, subAssetList])
}

export function useAssetContractMap() {
  const subAssetList = useSubAssetList()
  return useMemo(() => subAssetList.map((asset) => asset.contract), [subAssetList])
}

export function useTokensFromMap() {
  const subAssetList = useSubAssetList()
  return useMemo(
    () =>
      subAssetList.reduce((acc: TokenMap, asset) => {
        acc[asset.contract] = asset.token
        return acc
      }, {}),
    [subAssetList]
  )
}

export function useTokens() {
  const subAssetList = useSubAssetList()
  return useMemo(() => subAssetList.map((asset) => asset.token), [subAssetList])
}
