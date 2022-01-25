import { useMemo } from 'react'

import useWeb3React from 'hooks/useWeb3'
import { useConductedState } from './reducer'

export function useConductedContracts(): string[] {
  const { conducted } = useConductedState()
  const { chainId } = useWeb3React()

  return useMemo(() => {
    if (!chainId || !conducted[chainId]) return []
    return conducted[chainId].reduce((acc: string[], asset) => {
      acc.push(...[asset.long, asset.short])
      return acc
    }, [])
  }, [conducted, chainId])
}
