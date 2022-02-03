import { SupportedChainId } from './chains'

interface AddressMap {
  [chainId: number]: string
}

export const Multicall2: AddressMap = {
  [SupportedChainId.MAINNET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.RINKEBY]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.BSC]: '0xa9193376D09C7f31283C54e56D013fCF370Cd9D9',
  [SupportedChainId.HECO]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
  [SupportedChainId.POLYGON]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
  // [SupportedChainId.AVALANCHE]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
}

export const Collateral: AddressMap = {
  [SupportedChainId.MAINNET]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', // DEI
  [SupportedChainId.RINKEBY]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', // DEI
  [SupportedChainId.BSC]: '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  [SupportedChainId.HECO]: '0x0298c2b32eae4da002a15f36fdf7615bea3da047', // HUSD
  [SupportedChainId.POLYGON]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', // DEI
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', // DEI
}

export const Synchronizer: AddressMap = {
  [SupportedChainId.MAINNET]: '0x7a27a7BF25d64FAa090404F94606c580ce8E1D37',
  [SupportedChainId.BSC]: '0x3b62f3820e0b035cc4ad602dece6d796bc325325',
  [SupportedChainId.HECO]: '0xe82aa18b107aaf8D3829111C91CD0D133E0773DC',
  [SupportedChainId.POLYGON]: '0x5e16B021994e3c2536435CA3A45f0dA6536eD315',
}

export const SynchronizerV2: AddressMap = {
  [SupportedChainId.RINKEBY]: '0xbB8864C957FFF693a576796a38C97545eCE5eB26',
  [SupportedChainId.FANTOM]: '0xbB8864C957FFF693a576796a38C97545eCE5eB26',
}
