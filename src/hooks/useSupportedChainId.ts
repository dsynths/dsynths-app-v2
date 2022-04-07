import { useMemo } from 'react'

import { SynchronizerChains } from 'constants/chains'
import useWeb3React from './useWeb3'

// Allow user to connect any chain globally, but restrict unsupported ones if needed
export function useSupportedChainId() {
  const { chainId, account } = useWeb3React()
  return useMemo(() => {
    if (!chainId || !account) return false
    return SynchronizerChains.includes(chainId)
  }, [chainId, account])
}
