import { useMemo } from 'react'
import { Percent } from '@sushiswap/core-sdk'
import find from 'lodash/find'

import useWeb3React from 'hooks/useWeb3'
import { useQuotesState } from 'state/quotes/reducer'
import { useConductedState } from 'state/conducted/reducer'
import { useSignaturesState } from 'state/signatures/reducer'
import { Sector, useDetailsState } from 'state/details/reducer'
import { Direction } from './useTradePage'
import { constructPercentage } from 'utils/prices'

export interface SubAsset {
  id: string
  ticker: string
  name: string
  sector: Sector
  direction: Direction
  contract: string
  sibling: string
  symbol: string
  price: number
  fee: Percent
  open: boolean
}

export interface Asset {
  id: string
  long: SubAsset
  short: SubAsset
}

// https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false
  const testDummy: TValue = value
  return true
}

/**
 * A list of all conducted tokens supported by DEUS, where longs/shorts are considered siblings.
 */
export function useAssetList(): Asset[] {
  const { chainId } = useWeb3React()
  const { conducted } = useConductedState()
  const { quotes } = useQuotesState()
  const { signatures } = useSignaturesState()
  const { details } = useDetailsState()

  return useMemo(() => {
    if (!chainId || !conducted[chainId] || !quotes[chainId] || !signatures[chainId] || !details) return []

    return conducted[chainId]
      .map(({ id, long, short }) => {
        const quote = quotes[chainId][id]
        const longSigs = signatures[chainId][long]
        const shortSigs = signatures[chainId][short]
        const asset = details[id]

        if (!quote || !quote.long || !quote.short || !asset) {
          return null
        }

        const longAsset: SubAsset = {
          id,
          ticker: asset.symbol,
          name: asset.name,
          sector: asset.sector,
          direction: Direction.LONG,
          contract: long,
          sibling: short,
          symbol: asset.longSymbol,
          price: quote.long.price,
          fee: constructPercentage(quote.long.fee),
          open: !!longSigs,
        }

        const shortAsset: SubAsset = {
          id,
          ticker: asset.symbol,
          name: asset.name,
          sector: asset.sector,
          direction: Direction.SHORT,
          contract: short,
          sibling: long,
          symbol: asset.shortSymbol,
          price: quote.short.price,
          fee: constructPercentage(quote.short.fee),
          open: !!shortSigs,
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
export function useSubAssetList() {
  const assetList = useAssetList()
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
export function useLongAssetsList() {
  const subAssetList = useSubAssetList()
  return useMemo(() => subAssetList.filter((asset: SubAsset) => asset.direction === Direction.LONG), [subAssetList])
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
