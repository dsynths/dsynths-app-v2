import { useCallback } from 'react'
import { Currency } from '@sushiswap/core-sdk'
import { useRouter } from 'next/router'

import useWeb3React from 'hooks/useWeb3'
import { useCurrency } from 'hooks/useCurrency'
import { Collateral } from 'constants/addresses'
import { useConductedContracts } from 'state/conducted/hooks'
import { isAddress } from 'utils/validate'
import { ParsedUrlQueryInput } from 'querystring'

export default function useDefaultsFromURL(): {
  currencies: {
    baseCurrency: Currency | undefined
    quoteCurrency: Currency | undefined
  }
  setURLCurrency: (currency: any) => void
} {
  const { chainId } = useWeb3React()
  const contracts = useConductedContracts()
  const router = useRouter()

  const contract = router.query?.contract?.length ? router.query.contract[0] : ''
  const theme = router.query?.theme || undefined
  const baseCurrency = useCurrency(contracts.includes(contract) ? contract : undefined) || undefined
  const quoteCurrency = useCurrency((chainId && Collateral[chainId]) ?? Collateral[1]) || undefined

  function instanceOfCurrency(object: any): object is Currency {
    return 'isToken' in object
  }

  const setURLCurrency = useCallback(
    async (currencyOrContract: Currency | string) => {
      if (typeof currencyOrContract === 'string' && isAddress(currencyOrContract)) {
        const query: ParsedUrlQueryInput = { contract: currencyOrContract }
        // if there is a custom theme defined via url, preserve it
        if (theme) {
          query.theme = theme
        }
        await router.push({
          pathname: router.pathname,
          query,
        })
      } else if (instanceOfCurrency(currencyOrContract) && currencyOrContract?.wrapped?.address) {
        const query: ParsedUrlQueryInput = { contract: currencyOrContract.wrapped.address }
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
    [router]
  )

  return {
    currencies: { baseCurrency, quoteCurrency },
    setURLCurrency,
  }
}
