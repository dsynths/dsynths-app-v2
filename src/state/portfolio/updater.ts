import { useEffect } from 'react'
import { useAppDispatch } from 'state'
import { ZERO } from '@sushiswap/core-sdk'
import { BigNumber } from 'bignumber.js'

import { updateBalance, removeContract, updateTotalEquity } from './actions'
import useWeb3React from 'hooks/useWeb3'
import { useTokens } from 'hooks/useAssetList'
import { useTokenBalances } from 'state/wallet/hooks'
import { useActiveBalances } from './hooks'

export default function Updater(): null {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const assetTokens = useTokens()
  const assetBalances = useTokenBalances(account ?? undefined, assetTokens)
  const activeBalances = useActiveBalances()

  useEffect(() => {
    Object.entries(assetBalances).map(([contract, balance]) => {
      if (balance.equalTo(ZERO)) {
        return dispatch(removeContract({ contract }))
      }
      dispatch(updateBalance({ contract, balance: balance.toExact() }))
    }, {})
  }, [dispatch, assetBalances])

  useEffect(() => {
    const totalEquity = Object.values(activeBalances).reduce((acc: BigNumber, activeBalance) => {
      return acc.plus(new BigNumber(activeBalance.equity))
    }, new BigNumber('0'))

    dispatch(updateTotalEquity(totalEquity.toString()))
  }, [dispatch, activeBalances])

  return null
}
