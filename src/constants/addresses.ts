import { SupportedChainId } from './chains'
import { addresses } from 'lib/synchronizer'

interface AddressMap {
  [chainId: number]: string
}

export const Multicall2: AddressMap = {
  [SupportedChainId.RINKEBY]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
}

export const Collateral: AddressMap = {
  [SupportedChainId.RINKEBY]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
  [SupportedChainId.FANTOM]: addresses.Collateral[SupportedChainId.FANTOM],
}

export const DefaultSynth: AddressMap = {
  [SupportedChainId.RINKEBY]: '0xF62505Aaa2650E9FAcab5FDEf749FBe16c6cc080', // DEPRECATED
  [SupportedChainId.FANTOM]: '0xD5725f2F5807B629d08eAdd8c2D65A85B64C64bA', // TSLA
}

export const Synchronizer: AddressMap = {
  [SupportedChainId.RINKEBY]: '0xa4E7ed8548e4fB5d7E5a4fee907FD8C1430eEd0C', // DEPRECATED
  [SupportedChainId.FANTOM]: addresses.Synchronizer[SupportedChainId.FANTOM],
}

export const PartnerManager: AddressMap = {
  [SupportedChainId.RINKEBY]: '0x1164fe7a76D22EAA66f6A0aDcE3E3a30d9957A5f', // DEPRECATED
  [SupportedChainId.FANTOM]: addresses.PartnerManager[SupportedChainId.FANTOM],
}

export const PartnerId: { [partner: string]: string } = {
  DSYNTHS: '0x302041dbeB23bc42eb33E85f1c0aE8d5bEDa716A',
  JADE: '0x25749d05eCd6F55ad090D505Ba538bA1B85614Ac', // THIS IS TEMPORARY
}
