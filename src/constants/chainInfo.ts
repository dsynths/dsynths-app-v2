import { SupportedChainId } from './chains'

import MainnetLogo from 'assets/img/networks/mainnet.svg'
import RinkebyLogo from 'assets/img/networks/mainnet.svg'
import BinanceLogo from 'assets/img/networks/binance.svg'
import xDaiLogo from 'assets/img/networks/xdai.svg'
import HecoLogo from 'assets/img/networks/heco.svg'
import PolygonLogo from 'assets/img/networks/polygon.svg'
import FantomLogo from 'assets/img/networks/fantom.svg'

interface Info {
  chainId: string
  chainName: string
  label: string
  logoUrl: StaticImageData
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrl: string
  blockExplorerUrl: string
}

export const ChainInfo: { [chainId in SupportedChainId]: Info } = {
  [SupportedChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    label: 'Ethereum',
    logoUrl: MainnetLogo,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorerUrl: 'https://etherscan.io',
  },
  [SupportedChainId.RINKEBY]: {
    chainId: '0x4',
    chainName: 'Rinkeby',
    label: 'Rinkeby',
    logoUrl: RinkebyLogo,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: 'https://rinkeby.infura.io/v3/',
    blockExplorerUrl: 'https://rinkeby.etherscan.io',
  },
  [SupportedChainId.BSC]: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain Mainnet',
    label: 'BSC',
    logoUrl: BinanceLogo,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
  },
  [SupportedChainId.XDAI]: {
    chainId: '0x64',
    chainName: 'xDAI Chain',
    label: 'xDAI',
    logoUrl: xDaiLogo,
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'xDAI',
      decimals: 18,
    },
    rpcUrl: 'https://rpc.xdaichain.com',
    blockExplorerUrl: 'https://blockscout.com/poa/xdai',
  },
  [SupportedChainId.HECO]: {
    chainId: '0x80',
    chainName: 'Huobi ECO Chain Mainnet',
    label: 'HECO',
    logoUrl: HecoLogo,
    nativeCurrency: {
      name: 'HT',
      symbol: 'HT',
      decimals: 18,
    },
    rpcUrl: 'https://http-mainnet.hecochain.com',
    blockExplorerUrl: 'https://hecoinfo.com',
  },
  [SupportedChainId.POLYGON]: {
    chainId: '0x89',
    chainName: 'Matic Mainnet',
    label: 'Polygon',
    logoUrl: PolygonLogo,
    nativeCurrency: {
      name: 'Matic',
      symbol: 'Matic',
      decimals: 18,
    },
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
  },
  [SupportedChainId.FANTOM]: {
    chainId: '0xfa',
    chainName: 'Fantom Opera',
    label: 'Fantom',
    logoUrl: FantomLogo,
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrl: 'https://rpc.ftm.tools',
    blockExplorerUrl: 'https://ftmscan.com',
  },
  // [SupportedChainId.AVALANCHE]: {
  //   chainId: '0xa86a',
  //   chainName: 'Avalanche Mainnet C-chain',
  //   label: 'Avalanche',
  //   logoUrl: AvalancheLogo,
  //   nativeCurrency: {
  //     name: 'AVAX',
  //     symbol: 'AVAX',
  //     decimals: 18,
  //   },
  //   rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  //   blockExplorerUrl: 'https://snowtrace.io',
  // },
}
