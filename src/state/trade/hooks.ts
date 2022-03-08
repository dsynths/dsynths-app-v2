import { useCallback, useMemo } from 'react'
import { Currency } from '@sushiswap/core-sdk'
import { useRouter } from 'next/router'

import { useCurrency } from 'hooks/useCurrency'
import useWeb3React from 'hooks/useWeb3'
import { useRegistrars } from 'lib/synchronizer/hooks'
import { DefaultSynth, Collateral } from 'constants/addresses'
import { isAddress } from 'utils/validate'
import { ParsedUrlQueryInput } from 'querystring'

export default function useDefaultsFromURL(): {
  currencies: {
    baseCurrency: Currency | undefined
    quoteCurrency: Currency | undefined
  }
  setURLCurrency: (currencyOrContract: Currency | string) => void
} {
  const { chainId } = useWeb3React()
  const registrars = useRegistrars()
  const router = useRouter()

  const [theme, contract] = useMemo(() => {
    const contract = router.query?.registrarId || undefined
    const parsedContract = typeof contract === 'string' ? contract.toLowerCase() : ''

    return [router.query?.theme || undefined, parsedContract]
  }, [router])

  const baseCurrency =
    useCurrency(
      registrars.some((o) => o.contract.toLowerCase() === contract)
        ? contract
        : chainId
        ? DefaultSynth[chainId]
        : undefined
    ) || undefined
  const quoteCurrency = useCurrency(chainId ? Collateral[chainId] : Collateral[1]) || undefined

  function instanceOfCurrency(object: any): object is Currency {
    return 'isToken' in object
  }

  const setURLCurrency = useCallback(
    async (currencyOrContract: Currency | string) => {
      if (typeof currencyOrContract === 'string' && isAddress(currencyOrContract)) {
        const query: ParsedUrlQueryInput = { registrarId: currencyOrContract }
        // if there is a custom theme defined via url, preserve it
        if (theme) {
          query.theme = theme
        }
        await router.push({
          pathname: router.pathname,
          query,
        })
      } else if (instanceOfCurrency(currencyOrContract) && currencyOrContract?.wrapped?.address) {
        const query: ParsedUrlQueryInput = { registrarId: currencyOrContract.wrapped.address }
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
