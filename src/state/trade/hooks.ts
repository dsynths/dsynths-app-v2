import { useCallback, useMemo, useState } from 'react'
import { Currency } from '@sushiswap/core-sdk'
import { useRouter } from 'next/router'

import useWeb3React from 'hooks/useWeb3'
import { useCurrency } from 'hooks/useCurrency'
import { Collateral } from 'constants/addresses'
import { TradeType } from './reducer'
import { useConductedContracts } from 'state/conducted/hooks'
import { isAddress } from 'utils/validate'

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
  const baseCurrency = useCurrency(contracts.includes(contract) ? contract : undefined) || undefined
  const quoteCurrency = useCurrency((chainId && Collateral[chainId]) ?? Collateral[1]) || undefined

  function instanceOfCurrency(object: any): object is Currency {
    return 'isToken' in object
  }

  const setURLCurrency = useCallback(
    async (currencyOrContract: Currency | string) => {
      if (typeof currencyOrContract === 'string' && isAddress(currencyOrContract)) {
        await router.push({
          pathname: router.pathname,
          query: {
            contract: currencyOrContract,
          },
        })
      } else if (instanceOfCurrency(currencyOrContract) && currencyOrContract?.wrapped?.address) {
        await router.push({
          pathname: router.pathname,
          query: {
            contract: currencyOrContract.wrapped.address,
          },
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
