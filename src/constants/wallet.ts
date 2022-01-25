import { AbstractConnector } from '@web3-react/abstract-connector'

import INJECTED_ICON_URL from 'assets/img/wallets/injected.svg'
import COINBASE_ICON_URL from 'assets/img/wallets/coinbaseWalletIcon.png'
import FORTMATIC_ICON_URL from 'assets/img/wallets/fortmaticIcon.png'
import METAMASK_ICON_URL from 'assets/img/wallets/metamask.png'
import PORTIS_ICON_URL from 'assets/img/wallets/portisIcon.png'
import WALLETCONNECT_ICON_URL from 'assets/img/wallets/walletConnect.png'

import { fortmatic, injected, portis, walletconnect, walletlink } from '../connectors'

interface WalletInfo {
  readonly connector?: AbstractConnector
  readonly name: string
  readonly iconURL: StaticImageData
  readonly description: string
  readonly color: string
  readonly href?: string
  readonly primary?: true
  readonly mobile?: true
  readonly mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconURL: INJECTED_ICON_URL,
    description: 'Injected web3 provider.',
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconURL: METAMASK_ICON_URL,
    description: 'Easy-to-use browser extension.',
    color: '#E8831D',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconURL: WALLETCONNECT_ICON_URL,
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    color: '#4196FC',
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconURL: COINBASE_ICON_URL,
    description: 'Use Coinbase Wallet app on mobile device',
    color: '#315CF5',
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconURL: FORTMATIC_ICON_URL,
    description: 'Login using Fortmatic hosted wallet',
    color: '#6748FF',
    mobile: true,
  },
  PORTIS: {
    connector: portis,
    name: 'Portis',
    iconURL: PORTIS_ICON_URL,
    description: 'Login using Portis hosted wallet',
    color: '#4A6C9B',
    mobile: true,
  },
}
