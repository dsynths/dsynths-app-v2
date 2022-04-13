import { SupportedChainId } from './chains'
import { addresses } from 'lib/synchronizer'

interface AddressMap {
  [chainId: number]: string
}

export const Multicall2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
}

export const Collateral: AddressMap = {
  [SupportedChainId.FANTOM]: addresses.Collateral[SupportedChainId.FANTOM],
}

export const DefaultSynth: AddressMap = {
  [SupportedChainId.FANTOM]: '0xD5725f2F5807B629d08eAdd8c2D65A85B64C64bA', // TSLA
}

export const Synchronizer: AddressMap = {
  [SupportedChainId.FANTOM]: addresses.Synchronizer[SupportedChainId.FANTOM],
}

export const DeiMinter: AddressMap = {
  [SupportedChainId.FANTOM]: addresses.DeiMinter[SupportedChainId.FANTOM],
}

export const PartnerManager: AddressMap = {
  [SupportedChainId.FANTOM]: addresses.PartnerManager[SupportedChainId.FANTOM],
}

export const PartnerId: { [partner: string]: string } = {
  DSYNTHS: '0x302041dbeB23bc42eb33E85f1c0aE8d5bEDa716A',
  JADE: '0x302041dbeB23bc42eb33E85f1c0aE8d5bEDa716A', // THIS IS TEMPORARY
}
