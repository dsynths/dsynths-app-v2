import { MuonClient } from '@deusfinance/synchronizer-sdk'

enum GatewayURL {
  BALANCER = 'https://node-balancer.muon.net/v1/',
  NODE = 'https://node1.muon.net/v1/',
  LOCAL = 'http://104.131.177.195:8080/v1/',
}

export const Muon = new MuonClient(GatewayURL.BALANCER)
