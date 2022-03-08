import { Interface } from '@ethersproject/abi'
import { abis } from 'lib/synchronizer'

import { ERC20_ABI } from './ERC20'
import { ERC20_BYTES32_ABI } from './ERC20_BYTES32'

const ERC20_INTERFACE = new Interface(ERC20_ABI)
const ERC20_BYTES32_INTERFACE = new Interface(ERC20_BYTES32_ABI)

export { ERC20_ABI, ERC20_BYTES32_ABI, ERC20_INTERFACE, ERC20_BYTES32_INTERFACE }
export { Multicall2ABI } from './Multicall2'
export const { PartnerManager: PartnerManagerABI, Synchronizer: SynchronizerABI } = abis
