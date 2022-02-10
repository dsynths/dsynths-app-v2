import { useCallback } from 'react'
import { AppState, useAppSelector } from 'state'
import BigNumber from 'bignumber.js'

import { Sector } from 'state/details/reducer'
import { SynchronizerState } from './reducer'

export function useSynchronizerState(): SynchronizerState {
  return useAppSelector((state: AppState) => state.synchronizer)
}

export function useTotalFeeCallback() {
  const { platformFee, partnerFee } = useSynchronizerState()
  return useCallback(
    (sector: Sector) => {
      return new BigNumber(platformFee[sector]).plus(partnerFee[sector]).div(1e18)
    },
    [platformFee, partnerFee]
  )
}

export function usePlatformFeeCallback() {
  const { platformFee } = useSynchronizerState()
  return useCallback(
    (sector: Sector) => {
      return new BigNumber(platformFee[sector]).div(1e18)
    },
    [platformFee]
  )
}

export function usePartnerFeeCallback() {
  const { partnerFee } = useSynchronizerState()
  return useCallback(
    (sector: Sector) => {
      return new BigNumber(partnerFee[sector]).div(1e18)
    },
    [partnerFee]
  )
}
