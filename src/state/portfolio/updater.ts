import { useEffect } from 'react'
import { useAppDispatch } from 'state'
import { ZERO } from '@sushiswap/core-sdk'
import { BigNumber } from 'bignumber.js'

import { updateBalance, removeContract, updateTotalEquity } from './actions'
import useWeb3React from 'hooks/useWeb3'
import { useTokenBalances } from 'state/wallet/hooks'
import { useActiveBalances } from './hooks'
import { useRegistrarTokens } from 'lib/synchronizer/hooks'

export default function Updater(): null {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const registrarTokens = useRegistrarTokens()
  const tokenBalances = useTokenBalances(account ?? undefined, registrarTokens)
  const activeBalances = useActiveBalances()

  useEffect(() => {
    Object.entries(tokenBalances).map(([contract, balance]) => {
      if (balance.equalTo(ZERO)) {
        return dispatch(removeContract({ contract }))
      }
      dispatch(updateBalance({ contract, balance: balance.toExact() }))
    }, {})
  }, [dispatch, tokenBalances])

  useEffect(() => {
    const totalEquity = Object.values(activeBalances).reduce((acc: BigNumber, activeBalance) => {
      return acc.plus(new BigNumber(activeBalance.equity))
    }, new BigNumber('0'))

    dispatch(updateTotalEquity(totalEquity.toString()))
  }, [dispatch, activeBalances])

  return null
}
