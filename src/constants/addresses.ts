import { SupportedChainId } from './chains'

interface AddressMap {
  [chainId: number]: string
}

export const Multicall2: AddressMap = {
  [SupportedChainId.MAINNET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.RINKEBY]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.BSC]: '0xa9193376D09C7f31283C54e56D013fCF370Cd9D9',
  [SupportedChainId.XDAI]: '0x67dA5f2FfaDDfF067AB9d5F025F8810634d84287',
  [SupportedChainId.HECO]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
  [SupportedChainId.POLYGON]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
  // [SupportedChainId.AVALANCHE]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
}

export const Collateral: AddressMap = {
  [SupportedChainId.MAINNET]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', // DEI
  [SupportedChainId.POLYGON]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', // DEI
}

export const Synchronizer: AddressMap = {
  [SupportedChainId.MAINNET]: '0x7a27a7BF25d64FAa090404F94606c580ce8E1D37', // DEI
  [SupportedChainId.POLYGON]: '0x5e16B021994e3c2536435CA3A45f0dA6536eD315', // DEI
}
