import gql from 'graphql-tag'

export interface Tx {
  id: string // hash
  timestamp: string
  block: string
  method: string
  from: string
  to: string
  price: string
  amountIn: string
  amountOut: string
  daoFee: string
  partnerFee: string
  registrar: {
    id: string
    ticker: string
    name: string
    symbol: string
    type: string
  }
}

export interface TopMarket {
  id: string
  name: string
  ticker: string
  symbol: string
  type: string
  version: string
  quoteVolume: string
}

export interface SynchroniserStat {
  totalVolumeDEI: string
  registrarCount: string
  txCount: string
  daoFees: string
  partnerFees: string
}

export const TRANSACTIONS = gql`
  query getTransactions($account: Bytes!) {
    transactions(where: { from: $account }, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      block
      method
      from
      to
      price
      amountIn
      amountOut
      daoFee
      partnerFee
      registrar {
        id
        ticker
        name
        symbol
        type
      }
    }
  }
`

export const TOPMARKETS = gql`
  query getTopMarkets($count: Int!) {
    registrars(orderBy: quoteVolume, orderDirection: desc, first: $count) {
      id
      name
      ticker
      symbol
      type
      version
      quoteVolume
    }
  }
`

export const STATS = gql`
  query getSynchroniserStats {
    synchronizers {
      totalVolumeDEI
      registrarCount
      txCount
      daoFees
      partnerFees
    }
  }
`

export const SUBGRAPH_HEALTH = gql`
  query health($subgraphName: String!) {
    indexingStatusForCurrentVersion(subgraphName: $subgraphName) {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`
