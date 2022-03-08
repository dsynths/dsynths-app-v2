import { useMemo } from 'react'
import { Direction } from 'lib/synchronizer'

import useWeb3React from 'hooks/useWeb3'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { hooks } from './instance'

const {
  useRegistrars: _useRegistrars,
  useRegistrarPairs: _useRegistrarPairs,
  useRegistrarByContract: _useRegistrarByContract,
  useRegistrarTokens: _useRegistrarTokens,
  useRegistrarTokenMap: _useRegistrarTokenMap,
  useTotalFeeCallback,
  usePlatformFeeCallback,
  usePartnerFeeCallback,
  useForceRefreshCallback,
} = hooks

export { useTotalFeeCallback, usePlatformFeeCallback, usePartnerFeeCallback, useForceRefreshCallback }

export function useRegistrars(targetChainId?: number) {
  const { chainId } = useWeb3React()
  return _useRegistrars(targetChainId ?? chainId ?? FALLBACK_CHAIN_ID)
}

export function useRegistrarPairs(targetChainId?: number) {
  const { chainId } = useWeb3React()
  return _useRegistrarPairs(targetChainId ?? chainId ?? FALLBACK_CHAIN_ID)
}

export function useRegistrarByContract(contract: string, targetChainId?: number) {
  const { chainId } = useWeb3React()
  return _useRegistrarByContract(contract, targetChainId ?? chainId ?? FALLBACK_CHAIN_ID)
}

export function useRegistrarTokens(targetChainId?: number) {
  const { chainId } = useWeb3React()
  return _useRegistrarTokens(targetChainId ?? chainId ?? FALLBACK_CHAIN_ID)
}

export function useRegistrarTokenMap(targetChainId?: number) {
  const { chainId } = useWeb3React()
  return _useRegistrarTokenMap(targetChainId ?? chainId ?? FALLBACK_CHAIN_ID)
}

export function useLongRegistrars(targetChainId?: number) {
  const registrars = useRegistrars(targetChainId)
  return useMemo(() => registrars.filter((registrar) => registrar.direction === Direction.LONG), [registrars])
}

export function useRegistrarContractMap(targetChainId?: number) {
  const registrars = useRegistrars(targetChainId)
  return useMemo(() => registrars.map((registrar) => registrar.contract), [registrars])
}
