import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'

export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  ADDRESS = 'address',
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param type the type of the data
 * @param data the data to return a link for
 */
export function getExplorerLink(chainId: SupportedChainId, type: ExplorerDataType, data: string): string {
  const base = ChainInfo[chainId]['blockExplorerUrl']
  switch (type) {
    case ExplorerDataType.TRANSACTION:
      return `${base}/tx/${data}`
    case ExplorerDataType.ADDRESS:
      return `${base}/address/${data}`
    default:
      return base
  }
}
