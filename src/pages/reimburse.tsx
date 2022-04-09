import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { areEqual } from 'react-window'

import { useRegistrarByContract } from 'lib/synchronizer/hooks'
import { Direction, Registrar } from 'lib/synchronizer'
import { getApolloClient } from 'apollo/client/synchronizer'
import { ALL_INTERACTED_ACCOUNTS, ALL_SNAPSHOTS } from 'apollo/queries'
import { SupportedChainId } from 'constants/chains'
import { formatDollarAmount } from 'utils/numbers'
import { makeHttpRequest } from 'utils/http'

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

interface ConductPrices {
  [symbol: string]: number
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
  red?: boolean
}>`
  text-align: left;
  padding: 5px;
  color: ${({ theme, red }) => red && theme.red1};
`

const ShutdownPricesMap: { [symbol: string]: string } = {
  AAL: '17',
  AAPL: '174',
  ADA: '1.098',
  ALU: '0.1123',
  AMD: '119',
  AMZN: '3295',
  BA: '188',
  BTC: '44250',
  BRENTOIL: '120.6',
  CHF: '1.0744',
  COP: '107',
  DE: '436',
  DIS: '139',
  ETH: '3120',
  EUR: '1.09834',
  EXPE: '192',
  GBP: '1.31846',
  GME: '151',
  LOW: '213',
  MOS: '71',
  MRO: '26.04',
  OXY: '58.8',
  PFE: '52.77',
  NIC: '1.927',
  SLB: '41.7',
  SPGI: '413',
  TSLA: '1010',
  WHEAT: '380.6',
  XAU: '1955',
  XCU: '0.293',
  XPT: '999',
}

export default function Reimburse() {
  const snapshots = useSnapShots()
  const conductPrices = useConductPrices()

  return (
    <Container>
      <div>
        UPDATE: reimbursements have already been sent out, and trading has resumed. This table has been modified since
        the distribution, and now only serves for educational purposes.
      </div>
      <TableWrapper>
        <Head>
          <tr>
            <Cell>User</Cell>
            <Cell>Registrar</Cell>
            <Cell>Type</Cell>
            <Cell>Direction</Cell>
            <Cell>Price on March 25, 17:00 UTC</Cell>
            <Cell>Current price</Cell>
          </tr>
        </Head>
        <tbody>
          {Object.values(snapshots).map((userSnapshots, index) => (
            <MemoSnapshotGroup key={index} userSnapshots={userSnapshots} conductPrices={conductPrices} />
          ))}
        </tbody>
      </TableWrapper>
    </Container>
  )
}

const MemoSnapshotGroup = React.memo(SnapshotGroup, areEqual)

function SnapshotGroup({ userSnapshots, conductPrices }: { userSnapshots: Snapshot[]; conductPrices: ConductPrices }) {
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
            last={last}
            conductPrices={conductPrices}
          />
        )
      })}
    </>
  )
}

function SnapshotRow({
  user,
  contract,
  last,
  conductPrices,
}: {
  user: string
  contract: string
  last: boolean
  conductPrices: ConductPrices
}) {
  const registrar = useRegistrarByContract(contract)

  const calculatePrice = useCallback(
    (registrar: Registrar, price: string): string => {
      if (registrar.direction === Direction.LONG) return price
      // calculate short price
      if (!(registrar.ticker in conductPrices) || !parseFloat(price)) return '0'
      const conducted = conductPrices[registrar.ticker]
      return new BigNumber(2).times(conducted).minus(price).toFixed()
    },
    [conductPrices]
  )

  const oldPriceFormatted: string = useMemo(() => {
    if (!registrar || !(registrar.ticker in ShutdownPricesMap)) return '0'
    const price = calculatePrice(registrar, ShutdownPricesMap[registrar.ticker])
    return registrar.direction === Direction.LONG
      ? formatDollarAmount(parseFloat(price))
      : `${formatDollarAmount(parseFloat(price))} (${formatDollarAmount(
          parseFloat(ShutdownPricesMap[registrar.ticker])
        )})`
  }, [registrar, calculatePrice])

  const currentPriceFormatted: string = useMemo(() => {
    if (!registrar || !parseFloat(registrar.price)) return '0'
    return formatDollarAmount(parseFloat(registrar.price))
  }, [registrar])

  return (
    <Row showBorder={last}>
      <Cell>{user}</Cell>
      <Cell>{registrar?.ticker}</Cell>
      <Cell>{registrar?.sector}</Cell>
      <Cell red={registrar?.direction === Direction.SHORT}>{registrar?.direction}</Cell>
      <Cell>{oldPriceFormatted}</Cell>
      <Cell>{currentPriceFormatted}</Cell>
    </Row>
  )
}

function useConductPrices() {
  const [prices, setPrices] = useState<ConductPrices>({})

  useEffect(() => {
    const getPrices = async () => {
      try {
        const result = await makeHttpRequest('https://oracle1.deus.finance/fantom/conductPrice.json')
        setPrices(result)
      } catch (error) {
        console.log('Unable to fetch conductPrices from oracle')
        console.error(error)
        setPrices({})
      }
    }
    getPrices()
  }, [])

  return prices
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
