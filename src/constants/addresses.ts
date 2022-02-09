import { SupportedChainId } from './chains'

interface AddressMap {
  [chainId: number]: string
}

export const Multicall2: AddressMap = {
  [SupportedChainId.RINKEBY]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
}

export const Collateral: AddressMap = {
  [SupportedChainId.RINKEBY]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

export const DefaultSynth: AddressMap = {
  [SupportedChainId.MAINNET]: '0xc9f982e8f89E1c6626746e93E0B238701892b2f8', // TSLA
  [SupportedChainId.BSC]: '0x0DA9E2D04b3A7F9C4424171Ee2EE23c88FaC2783', // TSLA
  [SupportedChainId.HECO]: '0x6C503f804533C554a2dF47604D6630557b8bF1cA', // TSLA
  [SupportedChainId.POLYGON]: '0xF4849682B4D8C966a82d9Af3f5ec26B0E2A8Bb97', // TSLA
}

export const Synchronizer: AddressMap = {
  [SupportedChainId.RINKEBY]: '0xa4E7ed8548e4fB5d7E5a4fee907FD8C1430eEd0C',
  [SupportedChainId.FANTOM]: '0x5442a8c3FAc51454FB806a5B8bfe7121C8fAB678',
}
