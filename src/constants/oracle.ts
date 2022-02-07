// @ts-ignore
import Muon from 'muon'
import { SupportedChainId } from './chains'

export const ORACLE_BASE_URL_MAP = [
  new URL('https://oracle1.deus.finance'),
  // new URL('https://oracle2.deus.finance'),
  new URL('https://oracle3.deus.finance'),
]

export const INFO_BASE_URL = ORACLE_BASE_URL_MAP[0]

export const ORACLE_NETWORK_NAMES: { [chainId: number]: string } = {
  [SupportedChainId.MAINNET]: 'mainnet',
  [SupportedChainId.BSC]: 'bsc',
  [SupportedChainId.HECO]: 'heco',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.FANTOM]: 'fantom',
  [SupportedChainId.RINKEBY]: 'rinkeby',
}

// export const MuonClient = new Muon('https://node1.muon.net/v1/')
export const MuonClient = new Muon('http://104.131.177.195:8080/v1/')
// export const MuonClient = new Muon('https://node-balancer.muon.net/v1/')

// https://github.com/muon-protocol/muon-node-js/blob/7fb51305f7a4315bf3a4e3d2e258ba37bb4111e3/utils/node-utils/eth.js
export const MUON_NETWORK_NAMES: { [chainId: number]: string } = {
  [SupportedChainId.RINKEBY]: 'rinkeby',
  [SupportedChainId.FANTOM]: 'fantom',
}
