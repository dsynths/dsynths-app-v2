import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useBlockNumber } from 'state/application/hooks'
import { useSingleCallResult } from 'state/multicall/hooks'

import { useSynchronizerContract } from './useContract'
import { useSupportedChainId } from './useSupportedChainId'
import useWeb3React from './useWeb3'

export function useUserTokens() {
  const [tokens, setTokens] = useState<string[]>([])
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const blockNumber = useBlockNumber()
  const Synchronizer = useSynchronizerContract()

  const isValid = useMemo(() => account && chainId && isSupportedChainId, [account, chainId, isSupportedChainId])

  // TODO upgrade to Subgraphs
  // NOTE: multicall doesn't work here (it will revert EVERYTHING if one of the id's returns undefined)
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        if (!isValid || !Synchronizer || !account) return
        const result = await Promise.allSettled([
          Synchronizer.tokens(account, 0),
          Synchronizer.tokens(account, 1),
          Synchronizer.tokens(account, 2),
          Synchronizer.tokens(account, 3),
          Synchronizer.tokens(account, 4),
        ])
        const parsed = result.reduce((acc: string[], res) => {
          if (res.status !== 'fulfilled') return acc
          acc.push(res.value as string)
          return acc
        }, [])
        setTokens(parsed)
      } catch (err) {
        console.error('Unable to fetch claimable tokens:', err)
        setTokens([])
      }
    }
    fetchTokens()
  }, [isValid, Synchronizer, account, blockNumber])

  return tokens
}

export function useTimeElapsed(): {
  remainingSeconds: number
  claimable: boolean
} {
  const [trigger, setTrigger] = useState(0)
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const Synchronizer = useSynchronizerContract()

  const isValid = useMemo(() => account && chainId && isSupportedChainId, [account, chainId, isSupportedChainId])
  const lastTradeTimestampResult = useSingleCallResult(
    isValid ? Synchronizer : null,
    'lastTrade',
    account ? [account] : []
  )
  const delayTimestampResult = useSingleCallResult(isValid ? Synchronizer : null, 'delayTimestamp', [])

  const lastTradeTimestamp = useMemo(
    () =>
      lastTradeTimestampResult && lastTradeTimestampResult.result
        ? (lastTradeTimestampResult.result[0].toString() as string)
        : undefined,
    [lastTradeTimestampResult]
  )

  const delayTimestamp = useMemo(
    () => (delayTimestampResult && delayTimestampResult.result ? delayTimestampResult.result[0].toString() : undefined),
    [delayTimestampResult]
  )

  useEffect(() => {
    const triggerTimer = () => setTrigger((prev) => prev + 1)
    const self = setInterval(triggerTimer, 1000)
    return () => clearInterval(self)
  }, [])

  const currentTimestamp = useMemo(() => dayjs.utc().unix(), [trigger])
  const expirationTimestamp = useMemo(
    () =>
      lastTradeTimestamp && delayTimestamp
        ? parseInt(lastTradeTimestamp) + parseInt(delayTimestamp) + 10 // safety margin for RPC issues
        : dayjs.utc().unix() + 60,
    [lastTradeTimestamp, delayTimestamp]
  )

  const remainingSeconds = useMemo(
    () => expirationTimestamp - currentTimestamp,
    [expirationTimestamp, currentTimestamp]
  )

  return useMemo(
    () => ({
      remainingSeconds,
      claimable: !remainingSeconds ? false : remainingSeconds < 0,
    }),
    [remainingSeconds]
  )
}
