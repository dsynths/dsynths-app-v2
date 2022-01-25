import { useMemo } from 'react'
import { Currency, NATIVE } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'

export default function useNativeCurrency(): Currency | undefined {
  const { chainId } = useWeb3React()
  return useMemo(() => {
    return chainId ? NATIVE[chainId] : undefined
  }, [chainId])
}
