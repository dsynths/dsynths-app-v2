import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

import { FortmaticConnector } from './Fortmatic'
import { NetworkConnector } from './NetworkConnector'

import { getLibrary } from 'utils/library'

import { INFURA_KEY, FORMATIC_KEY, PORTIS_ID } from 'constants/keys'
import { FALLBACK_CHAIN_ID, NETWORK_URLS, SUPPORTED_CHAIN_IDS } from 'constants/chains'

if (!INFURA_KEY || typeof INFURA_KEY === 'undefined') {
  throw new Error('NEXT_PUBLIC_INFURA_KEY must be a defined environment variable')
}

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(network.provider))
}

export const network = new NetworkConnector({
  urls: NETWORK_URLS,
  defaultChainId: FALLBACK_CHAIN_ID,
})

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
})

export const walletconnect = new WalletConnectConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
  rpc: NETWORK_URLS,
  qrcode: true,
})

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: 1,
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [1],
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URLS[1],
  appName: 'DEUS Finance',
  appLogoUrl: require('/public/static/images/AppLogo.png'),
  supportedChainIds: SUPPORTED_CHAIN_IDS,
})
