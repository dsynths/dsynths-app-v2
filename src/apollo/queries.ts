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
