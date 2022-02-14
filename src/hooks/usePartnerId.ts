import { useMemo } from 'react'

import { PartnerId } from 'constants/addresses'
import { useIsJadeTheme } from './useTheme'

export function useIsPartner(): boolean {
  const partnerId = usePartnerId()
  return useMemo(() => partnerId !== PartnerId.DSYNTHS, [partnerId])
}

export function usePartnerId(): string {
  const isJade = useIsJadeTheme()

  return useMemo(() => {
    return isJade ? PartnerId.JADE : PartnerId.DSYNTHS
  }, [isJade])
}
