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
  [SupportedChainId.RINKEBY]: '0xF62505Aaa2650E9FAcab5FDEf749FBe16c6cc080', // BTC (TODO update this on official launch)
  [SupportedChainId.FANTOM]: '0x3A80584Cede024eFd4dE73C8E1f55fA0d8544b54', // AAPL (TODO update this on official launch)
}

export const Synchronizer: AddressMap = {
  [SupportedChainId.RINKEBY]: '0xa4E7ed8548e4fB5d7E5a4fee907FD8C1430eEd0C',
  [SupportedChainId.FANTOM]: '0x5442a8c3FAc51454FB806a5B8bfe7121C8fAB678',
}

export const PartnerManager: AddressMap = {
  [SupportedChainId.RINKEBY]: '0x1164fe7a76D22EAA66f6A0aDcE3E3a30d9957A5f', // TODO change this
  [SupportedChainId.FANTOM]: '0xc01bc169894dd066ea50008c19b389a88e1c11fc', // TODO change this
}

export const PartnerId: AddressMap = {
  [SupportedChainId.RINKEBY]: '0x1164fe7a76D22EAA66f6A0aDcE3E3a30d9957A5f', // TODO change this
  [SupportedChainId.FANTOM]: '0x9dBFCF31baC3636A731C49eCdAA91531025a164b', // TODO change this
}
