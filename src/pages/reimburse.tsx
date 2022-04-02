import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { useRegistrarByContract } from 'lib/synchronizer/hooks'
import { getApolloClient } from 'apollo/client/synchronizer'
import { ALL_INTERACTED_ACCOUNTS, ALL_SNAPSHOTS } from 'apollo/queries'
import { SupportedChainId } from 'constants/chains'
import { formatDollarAmount } from 'utils/numbers'

interface Interaction {
  from: string
  to: string
}

interface SnapshotRegistrar {
  id: string
  name: string
  ticker: string
  symbol: string
  type: string
}

interface Snapshot {
  user: string
  timestamp: string
  registrar: SnapshotRegistrar
  amount: string
}

interface UserSnapshots {
  [user: string]: Snapshot[]
}

interface RegistrarUserSnapshots {
  [symbol: string]: Snapshot[]
}

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
  overflow: visible;
  margin: 75px auto;
  width: clamp(250px, 90%, 1200px);

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 30px;
  `}
`

const TableWrapper = styled.table`
  width: 100%;
  overflow: hidden;
  border-collapse: collapse;
`

const Head = styled.thead`
  & > tr {
    height: 50px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text1};
    background: ${({ theme }) => theme.bg0};
    border: 1px solid ${({ theme }) => theme.border1};
  }
`

const Row = styled.tr<{
  showBorder: boolean
}>`
  align-items: center;
  font-size: 0.8rem;
  line-height: 0.8rem;
  ${({ theme, showBorder }) =>
    showBorder &&
    `
    border-bottom: 1px solid ${theme.border2};
  `}
`

const Cell = styled.td<{
  justify?: boolean
}>`
  text-align: left;
  padding: 5px;
`

const ShutdownPricesMap: { [symbol: string]: string } = {}

export default function Reimburse() {
  const snapshots = useSnapShots()

  return (
    <Container>
      <TableWrapper>
        <Head>
          <tr>
            <Cell>User</Cell>
            <Cell>Registrar</Cell>
            <Cell>Type</Cell>
            <Cell>Direction</Cell>
            <Cell>Current Position</Cell>
            <Cell>Price at shutdown</Cell>
            <Cell>Current price</Cell>
            <Cell>USD Delta</Cell>
          </tr>
        </Head>
        <tbody>
          {Object.values(snapshots).map((userSnapshots, index) => (
            <SnapshotGroup key={index} userSnapshots={userSnapshots} />
          ))}
        </tbody>
      </TableWrapper>
    </Container>
  )
}

function SnapshotGroup({ userSnapshots }: { userSnapshots: Snapshot[] }) {
  const grouped = useMemo(
    () =>
      userSnapshots.reduce((acc: RegistrarUserSnapshots, obj) => {
        const symbol = obj.registrar.symbol
        if (!acc[symbol]) {
          acc[symbol] = []
        }
        acc[symbol].push(obj)
        return acc
      }, {}),
    [userSnapshots]
  )

  return (
    <>
      {Object.values(grouped).map((results, index) => {
        const amount = results[results.length - 1].amount
        const last = index === Object.entries(grouped).length - 1

        if (!parseFloat(amount)) {
          if (last) return <Row key={index} showBorder={last} />
          return null
        }
        return (
          <SnapshotRow
            key={index}
            user={results[0].user}
            contract={results[0].registrar.id}
            amount={amount}
            last={last}
          />
        )
      })}
    </>
  )
}

function SnapshotRow({
  user,
  contract,
  amount,
  last,
}: {
  user: string
  contract: string
  amount: string
  last: boolean
}) {
  const registrar = useRegistrarByContract(contract)

  const [oldPrice, oldPriceFormatted]: string[] = useMemo(() => {
    if (!registrar || !(registrar.symbol in ShutdownPricesMap)) {
      return ['0', '']
    }
    return [ShutdownPricesMap[registrar.symbol], formatDollarAmount(parseFloat(ShutdownPricesMap[registrar.symbol]))]
  }, [registrar])

  const [currentPrice, currentPriceFormatted]: string[] = useMemo(() => {
    if (!registrar || !parseFloat(registrar.price)) {
      return ['0', '']
    }
    return [registrar.price, formatDollarAmount(parseFloat(registrar.price))]
  }, [registrar])

  return (
    <Row showBorder={last}>
      <Cell>{user}</Cell>
      <Cell>{registrar?.ticker}</Cell>
      <Cell>{registrar?.sector}</Cell>
      <Cell>{registrar?.direction}</Cell>
      <Cell>{amount}</Cell>
      <Cell>{oldPriceFormatted}</Cell>
      <Cell>{currentPriceFormatted}</Cell>
      <Cell></Cell>
    </Row>
  )
}

function useSnapShots() {
  const allAccounts = useAllAccounts()
  const [snapshots, setSnapshots] = useState<UserSnapshots>({})

  const fetchSnapshots = useCallback(async () => {
    const DEFAULT_RETURN: Snapshot[] = []
    try {
      const client = getApolloClient(SupportedChainId.FANTOM)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: ALL_SNAPSHOTS,
        variables: { users: allAccounts },
        fetchPolicy: 'no-cache',
      })

      return data.userBalanceSnapshots as Snapshot[]
    } catch (error) {
      console.log('Unable to fetch snapshots from The Graph Network')
      console.error(error)
      return []
    }
  }, [allAccounts])

  useEffect(() => {
    const getSnapshots = async () => {
      const result = await fetchSnapshots()
      const filteredByUser = result.reduce((acc: UserSnapshots, obj) => {
        if (!acc[obj.user]) {
          acc[obj.user] = []
        }
        acc[obj.user].push(obj)
        return acc
      }, {})
      setSnapshots(filteredByUser)
    }
    getSnapshots()
  }, [fetchSnapshots])

  return snapshots
}

function useAllAccounts() {
  const [accounts, setAccounts] = useState<string[]>([])

  const fetchAccounts = useCallback(async () => {
    const DEFAULT_RETURN: Interaction[] = []
    try {
      const client = getApolloClient(SupportedChainId.FANTOM)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: ALL_INTERACTED_ACCOUNTS,
        fetchPolicy: 'no-cache',
      })

      return data.transactions as Interaction[]
    } catch (error) {
      console.log('Unable to fetch transactions from The Graph Network')
      console.error(error)
      return []
    }
  }, [])

  useEffect(() => {
    const getAccounts = async () => {
      const result = await fetchAccounts()
      const filtered = result.reduce((acc: string[], obj) => {
        if (!acc.includes(obj.from)) acc.push(obj.from)
        if (!acc.includes(obj.to)) acc.push(obj.to)
        return acc
      }, [])
      setAccounts(filtered)
    }
    getAccounts()
  }, [fetchAccounts])

  return accounts
}
