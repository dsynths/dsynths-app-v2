import { useCallback, useMemo } from 'react'
import { Currency } from '@sushiswap/core-sdk'
import { useRouter } from 'next/router'

import useWeb3React from 'hooks/useWeb3'
import { useCurrency } from 'hooks/useCurrency'
import { DefaultSynth, Collateral } from 'constants/addresses'
import { useSubAssetList } from 'hooks/useAssetList'
import { isAddress } from 'utils/validate'
import { ParsedUrlQueryInput } from 'querystring'
import { FALLBACK_CHAIN_ID } from 'constants/chains'

export default function useDefaultsFromURL(): {
  currencies: {
    baseCurrency: Currency | undefined
    quoteCurrency: Currency | undefined
  }
  setURLCurrency: (currencyOrContract: Currency | string) => void
} {
  const { chainId } = useWeb3React()
  const assets = useSubAssetList()
  const router = useRouter()

  const [theme, contract] = useMemo(() => {
    const contract = router.query?.assetId || undefined
    const parsedContract = typeof contract === 'string' ? contract.toLowerCase() : ''

    return [router.query?.theme || undefined, parsedContract]
  }, [router])

  const baseCurrency =
    useCurrency(
      assets.some((o) => o.contract.toLowerCase() === contract)
        ? contract
        : DefaultSynth[FALLBACK_CHAIN_ID]
    ) || undefined
  const quoteCurrency = useCurrency(chainId ? Collateral[chainId] : Collateral[1]) || undefined

  function instanceOfCurrency(object: any): object is Currency {
    return 'isToken' in object
  }

  const setURLCurrency = useCallback(
    async (currencyOrContract: Currency | string) => {
      if (typeof currencyOrContract === 'string' && isAddress(currencyOrContract)) {
        const query: ParsedUrlQueryInput = { assetId: currencyOrContract }
        // if there is a custom theme defined via url, preserve it
        if (theme) {
          query.theme = theme
        }
        await router.push({
          pathname: router.pathname,
          query,
        })
      } else if (instanceOfCurrency(currencyOrContract) && currencyOrContract?.wrapped?.address) {
        const query: ParsedUrlQueryInput = { assetId: currencyOrContract.wrapped.address }
        // if there is a custom theme defined via url, preserve it
        if (theme) {
          query.theme = theme
        }
        await router.push({
          pathname: router.pathname,
          query,
        })
      }
    },
    [router, theme]
  )

  return {
    currencies: { baseCurrency, quoteCurrency },
    setURLCurrency,
  }
}
