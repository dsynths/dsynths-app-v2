// @ts-ignore
import Muon from 'muon'
import { SupportedChainId } from './chains'

export const INFO_BASE_URL = new URL('https://oracle1.deus.finance')

export const ORACLE_NETWORK_NAMES: { [chainId: number]: string } = {
  [SupportedChainId.RINKEBY]: 'rinkeby',
  [SupportedChainId.FANTOM]: 'fantom',
}

export const MuonClient = new Muon('https://node1.muon.net/v1/')
// export const MuonClient = new Muon('http://104.131.177.195:8080/v1/')
// export const MuonClient = new Muon('https://node-balancer.muon.net/v1/')

// https://github.com/muon-protocol/muon-node-js/blob/7fb51305f7a4315bf3a4e3d2e258ba37bb4111e3/utils/node-utils/eth.js
export const MUON_NETWORK_NAMES: { [chainId: number]: string } = {
  [SupportedChainId.RINKEBY]: 'rinkeby',
  [SupportedChainId.FANTOM]: 'fantom',
}

export interface MuonResponse {
  success?: boolean
  app: string
  cid: string
  confirmed: boolean
  confirmedAt: number
  data: {
    init: {
      none: string
      nonceAddress: string
      party: string
    }
    params: {
      action: string
      chain: string
      tokenId: string
      useMultiplier: boolean
    }
    result: {
      action: string
      address: string
      chain: string
      expireBlock: number
      multiplier: number
      price: string
    }
  }
  method: string
  nSign: number
  owner: string
  peerId: string
  reqId: string
  signatures: {
    owner: string
    ownerPubKey: {
      x: string
      yParity: string
    }
    result: {
      action: string
      address: string
      chain: string
      expireBlock: number
      price: string
    }
    signature: string
    timestamp: number
  }[]
  sigs: Array<{
    nonce: string
    owner: string
    signature: string
  }>
  startedAt: number
  _id: string
}
