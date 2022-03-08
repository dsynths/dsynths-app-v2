import { createSynchronizer } from '@deusfinance/synchronizer-sdk'

import useWeb3React from 'hooks/useWeb3'
import { usePartnerId } from 'hooks/usePartnerId'
import { FALLBACK_CHAIN_ID } from 'constants/chains'

const synchronizer = createSynchronizer()
export default synchronizer

export function SynchronizerUpdater() {
  const { chainId } = useWeb3React()
  const partnerId = usePartnerId()

  return <synchronizer.Updater chainId={chainId ?? FALLBACK_CHAIN_ID} partnerId={partnerId} />
}

export const hooks = synchronizer.hooks
