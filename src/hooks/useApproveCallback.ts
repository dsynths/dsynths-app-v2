import { useCallback, useMemo, useState } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { MaxUint256 } from '@ethersproject/constants'
import { Currency } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { useERC20Contract } from './useContract'
import useERC20Allowance from './useERC20Allowance'

import { useTransactionAdder, useHasPendingApproval } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils/web3'
import { BigNumber } from '@ethersproject/bignumber'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export default function useApproveCallback(
  currency: Currency | undefined,
  spender: string | undefined
): [ApprovalState, () => Promise<void>] {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [allowance, setAllowance] = useState(BigNumber.from('1')) // mitigate jumping on boot + reloads

  const token = currency?.isToken ? currency : undefined
  const currentAllowance = useERC20Allowance(token, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const TokenContract = useERC20Contract(token?.address)

  const approvalState = useMemo(() => {
    // if (allowance.eq(1)) return ApprovalState.APPROVED

    if (!currency) return ApprovalState.UNKNOWN
    if (!spender) return ApprovalState.UNKNOWN
    if (currency.isNative) return ApprovalState.APPROVED
    if (!currentAllowance) return ApprovalState.UNKNOWN

    return currentAllowance.gt(0)
      ? ApprovalState.APPROVED
      : pendingApproval
      ? ApprovalState.PENDING
      : ApprovalState.NOT_APPROVED
  }, [allowance, currency, spender, currentAllowance, pendingApproval])

  const approve = useCallback(async () => {
    if (approvalState === ApprovalState.APPROVED || approvalState === ApprovalState.PENDING) {
      console.error('approve was called unnecessarily')
      return
    }

    if (!chainId) {
      console.error('no chainId')
      return
    }

    if (!TokenContract) {
      console.error('TokenContract is null')
      return
    }

    if (!account) {
      console.error('account is null')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    const estimatedGas = await TokenContract.estimateGas.approve(spender, MaxUint256)
    return TokenContract.approve(spender, MaxUint256, {
      gasLimit: calculateGasMargin(estimatedGas),
    })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + token?.symbol,
          approval: { tokenAddress: token?.address, spender },
        })
      })
      .catch((error: Error) => {
        console.error('Failed to approve token for an unknown reason', error)
      })
  }, [approvalState, TokenContract, spender, token, addTransaction, chainId, account])

  return [approvalState, approve]
}
