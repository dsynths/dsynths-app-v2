import { createApolloClient } from './index'

const fantomClient = createApolloClient(`https://api.thegraph.com/subgraphs/name/${getSubgraphName(250)}`)

export function getApolloClient(chainId) {
  switch (Number(chainId)) {
    case 250:
      return fantomClient
    default:
      console.error(`${chainId} is not a supported subgraph network`)
      return null
  }
}

export function getSubgraphName(chainId) {
  switch (Number(chainId)) {
    case 250:
      return 'dsynths/synchronizer-fantom'
    default:
      console.error(`${chainId} is not a supported subgraph network`)
      return null
  }
}
