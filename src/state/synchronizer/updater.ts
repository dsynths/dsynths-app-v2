import { useEffect, useMemo } from 'react'
import { useAppDispatch } from 'state'

import useWeb3React from 'hooks/useWeb3'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { usePartnerManager } from 'hooks/useContract'

import { updatePlatformFee, updatePartnerFee } from './reducer'
import { SynchronizerChains } from 'constants/chains'
import { PartnerId } from 'constants/addresses'
import { Sector } from 'state/details/reducer'

export default function Updater(): null {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const PartnerManager = usePartnerManager()

  const isSupported: boolean = useMemo(
    () => (chainId ? Object.values(SynchronizerChains).includes(chainId) : false),
    [chainId]
  )

  const address = useMemo(() => (!isSupported || !chainId ? undefined : PartnerId[chainId]), [isSupported, chainId])
  const feeCalls = useMemo(
    () =>
      !isSupported
        ? []
        : [
            { methodName: 'partnerFee', callInputs: [address, 0] },
            { methodName: 'partnerFee', callInputs: [address, 1] },
            { methodName: 'partnerFee', callInputs: [address, 2] },
            { methodName: 'platformFee', callInputs: [0] },
            { methodName: 'platformFee', callInputs: [1] },
            { methodName: 'platformFee', callInputs: [2] },
          ],
    [isSupported, address]
  )

  const feeResponse = useSingleContractMultipleMethods(PartnerManager, feeCalls)

  useEffect(() => {
    const [partnerStocks, partnerCrypto, partnerForex, platformStocks, platformCrypto, platformForex] = feeResponse

    // partner
    if (partnerStocks?.result) {
      const fee = partnerStocks.result[0]
      dispatch(
        updatePartnerFee({
          [Sector.STOCKS]: fee.toString(),
        })
      )
    }
    if (partnerCrypto?.result) {
      const fee = partnerCrypto.result[0]
      dispatch(
        updatePartnerFee({
          [Sector.CRYPTO]: fee.toString(),
        })
      )
    }
    if (partnerForex?.result) {
      const fee = partnerForex.result[0]
      dispatch(
        updatePartnerFee({
          [Sector.FOREX]: fee.toString(),
        })
      )
    }

    // platform
    if (platformStocks?.result) {
      const fee = platformStocks.result[0]
      dispatch(
        updatePlatformFee({
          [Sector.STOCKS]: fee.toString(),
        })
      )
    }
    if (platformCrypto?.result) {
      const fee = platformCrypto.result[0]
      dispatch(
        updatePlatformFee({
          [Sector.CRYPTO]: fee.toString(),
        })
      )
    }
    if (platformForex?.result) {
      const fee = platformForex.result[0]
      dispatch(
        updatePlatformFee({
          [Sector.FOREX]: fee.toString(),
        })
      )
    }
  }, [feeResponse])

  return null
}
