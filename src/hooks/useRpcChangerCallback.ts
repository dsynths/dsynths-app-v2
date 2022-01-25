import { useCallback } from 'react'

import useWeb3React from './useWeb3'
import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'

export default function useRpcChangerCallback() {
  const { account, chainId, library } = useWeb3React()

  return useCallback(
    async (targetChainId: SupportedChainId) => {
      if (!chainId) return
      if (!targetChainId || !ChainInfo[targetChainId]) return
      if (targetChainId === chainId) return
      if (!window.ethereum) return

      try {
        await library?.send('wallet_switchEthereumChain', [{ chainId: ChainInfo[targetChainId].chainId }])
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            return await library?.send('wallet_addEthereumChain', [ChainInfo[targetChainId], account])
          } catch (addError) {
            console.log('Something went wrong trying to add a new  network RPC: ')
            return console.error(addError)
          }
        }
        // handle other "switch" errors
        console.log('Unknown error occured when trying to change the network RPC: ')
        console.error(switchError)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [chainId, library, account]
  )
}
