import { useMemo } from 'react'
import { Currency, NATIVE } from '@sushiswap/core-sdk'

import { SupportedChainId } from 'constants/chains'
import useWeb3React from './useWeb3'

export default function useNativeCurrency(): Currency {
  const { chainId } = useWeb3React()
  return useMemo(
    () =>
      chainId
        ? NATIVE[chainId]
        : // display mainnet when not connected
          NATIVE[SupportedChainId.MAINNET],
    [chainId]
  )
}
