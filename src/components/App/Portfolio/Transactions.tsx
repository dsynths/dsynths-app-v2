import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { ArrowUp } from 'react-feather'

import { getApolloClient } from 'apollo/client/synchronizer'
import { TRANSACTIONS, Tx } from 'apollo/queries'
import { timestampToObject } from 'utils/time'
import { formatDollarAmount } from 'utils/numbers'
import { ExplorerDataType, getExplorerLink } from 'utils/explorers'

import useWeb3React from 'hooks/useWeb3'
import { useIsJadeTheme } from 'hooks/useTheme'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'
import ImageWithFallback from 'components/ImageWithFallback'

const Wrapper = styled(Card)<{
  border?: boolean
}>`
  border: ${({ theme, border }) => (border ? `1px solid ${theme.border2}` : 'none')};
  padding: 0.8rem 0;
`

// @shadow, I created this row and all other elements for demo purposes. Do whatever you want!
const Row = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 0.8rem;

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }

  & > * {
    &:last-child {
      margin-left: auto;
    }
  }
`

const ITEMS_PER_OFFSET = 5

export default function Transactions() {
  const { chainId, account } = useWeb3React()
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [offset, setOffset] = useState(0)
  const isJadeTheme = useIsJadeTheme()

  const fetchTransactions = useCallback(async () => {
    const DEFAULT_RETURN: Tx[] = []
    try {
      if (!account || !chainId) return DEFAULT_RETURN
      const client = getApolloClient(chainId)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: TRANSACTIONS,
        variables: { account: account.toLowerCase() }, // non-lowercase queries do NOT work
        fetchPolicy: 'no-cache',
      })

      return data.transactions as Tx[]
    } catch (error) {
      console.log('Unable to fetch transactions from The Graph Network')
      console.error(error)
      return []
    }
  }, [chainId, account])

  useEffect(() => {
    const getTransactions = async () => {
      const result = await fetchTransactions()
      setTransactions(result)
    }
    getTransactions()
  }, [fetchTransactions])

  const paginatedTransactions = useMemo(() => {
    return transactions.slice(0, offset * ITEMS_PER_OFFSET + ITEMS_PER_OFFSET)
  }, [transactions, offset])

  const showLoadMore = useMemo(() => {
    return paginatedTransactions.length % ITEMS_PER_OFFSET == 0
  }, [paginatedTransactions])

  useEffect(() => {
    setOffset(0)
  }, [chainId, account])

  const onLoadMore = () => {
    setOffset((prev) => (prev += 1))
  }

  return (
    <Wrapper border={isJadeTheme}>
      {paginatedTransactions.length > 0 ? (
        <>
          {paginatedTransactions.map((tx, index) => (
            <TransactionRow tx={tx} key={index} />
          ))}
          {showLoadMore && <div onClick={() => onLoadMore()}>Load more transactions</div>}
        </>
      ) : (
        <div>No transactions to show</div>
      )}
    </Wrapper>
  )
}

// @shadow, play around with this to get a sense of the results:
// https://thegraph.com/hosted-service/subgraph/dsynths/synchronizer-fantom?query=Transactions
function TransactionRow({ tx }: { tx: Tx }) {
  const { chainId } = useWeb3React()

  const { date, time } = useMemo(() => {
    const obj = timestampToObject(parseInt(tx.timestamp))
    return {
      date: obj.format('MMMM DD, YYYY'),
      time: obj.format('hh:mm A'),
    }
  }, [tx])

  const { method, amount, color } = useMemo(() => {
    return {
      method: tx.method === 'open' ? 'Buy' : 'Sell',
      amount: tx.method === 'open' ? tx.amountIn : tx.amountOut,
      color: tx.method === 'open' ? 'green' : 'red',
    }
  }, [tx])

  const logo = useCurrencyLogo(tx.registrar.ticker, undefined)

  if (!chainId) {
    return null
  }

  return (
    <ExternalLink href={getExplorerLink(chainId, ExplorerDataType.TRANSACTION, tx.id)}>
      <Row>
        <ArrowUp size={20} color={color} />
        <ImageWithFallback src={logo} alt={`${tx.registrar.ticker} Logo`} width={20} height={20} />
        <div>
          {method} {tx.registrar.symbol} for {formatDollarAmount(Number(amount))}
        </div>
        <div>
          {date} {time}
        </div>
      </Row>
    </ExternalLink>
  )
}
