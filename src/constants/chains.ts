import { INFURA_KEY } from './keys'

export enum SupportedChainId {
  MAINNET = 1,
  RINKEBY = 4,
  BSC = 56,
  XDAI = 100,
  HECO = 128,
  POLYGON = 137,
  FANTOM = 250,
  // AVALANCHE = 43114, // temp disabled due to error, awaiting for @web3-react v8 to go out of beta. https://github.com/NoahZinsmeister/web3-react/issues/322#issuecomment-1010382663
}

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number'
) as SupportedChainId[]

export const SynchronizerChains = [
  SupportedChainId.MAINNET,
  SupportedChainId.RINKEBY,
  SupportedChainId.BSC,
  SupportedChainId.HECO,
  SupportedChainId.POLYGON,
  SupportedChainId.FANTOM,
]

export const SynchronizerV2Chains = [SupportedChainId.FANTOM, SupportedChainId.RINKEBY]

export const ProxyChains = [SupportedChainId.XDAI]

export const NETWORK_URLS = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.BSC]: 'https://bsc-dataseed1.binance.org',
  [SupportedChainId.XDAI]: 'https://rpc.xdaichain.com',
  [SupportedChainId.HECO]: 'https://http-mainnet.hecochain.com',
  [SupportedChainId.POLYGON]: 'https://polygon-rpc.com',
  [SupportedChainId.FANTOM]: 'https://rpc.ftm.tools',
  // [SupportedChainId.AVALANCHE]: 'https://api.avax.network/ext/bc/C/rpc',
}
