import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { ArrowRight, Repeat, ExternalLink as ExtLink, Info } from 'react-feather'
import useCollapse from 'react-collapsed'
import ReactTooltip from 'react-tooltip'

import { getApolloClient } from 'apollo/client/synchronizer'
import { TRANSACTIONS, Tx } from 'apollo/queries'
import { timestampToObject } from 'utils/time'
import { ExplorerDataType, getExplorerLink } from 'utils/explorers'

import useWeb3React from 'hooks/useWeb3'
import { useIsJadeTheme } from 'hooks/useTheme'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'
import ImageWithFallback from 'components/ImageWithFallback'
import { NavButton } from 'components/Button'
import { truncateHash } from 'utils/account'
import { formatDollarAmount } from 'utils/numbers'

const Wrapper = styled(Card)<{
  border?: boolean
}>`
  border: ${({ theme, border }) => (border ? `1px solid ${theme.border2}` : 'none')};
  padding: 0.8rem;
`
const Box = styled.div`
  padding: 0.25rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border2};
  margin: 0.25rem 0rem 1rem 0rem;
`

const TransactionRecord = styled.div<{
  isExpanded: boolean
}>`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding-top: 0.8rem;
  margin: ${({ isExpanded }) => (isExpanded ? `0.2rem` : `0rem`)};
  border: ${({ theme, isExpanded }) => (isExpanded ? `1px solid ${theme.border1}` : `none`)};
  border-radius: ${({ isExpanded }) => (isExpanded ? `10px` : `0px`)};

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
`

const TransactionHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
`

const TransactionContentWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  margin-top: 0.8rem;
`

const TransactionContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 0 0.5rem;
`

export const CellWrapper = styled.div<{ flex?: string }>`
  display: flex;
  flex-flow: row no-wrap;
  justify-content: flex-start;
  align-items: center;
  padding: 0rem 0.25rem;
  gap: 0.5rem;
  flex: ${({ flex }) => flex ?? '0 0 25%'};
`

export const ActionIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg2};
  border-radius: 50%;
  min-width: 25px;
  min-height: 25px;
  border: 1px solid ${({ theme }) => theme.border2};
`

export const ActionDetailsWrapper = styled.div`
  display: flex;
  align-items: start;
  justify-content: center;
  flex-direction: column;
  font-size: 0.8rem;
  colour: ${({ theme }) => theme.text1};
  gap: 0.25rem;
`

const Divider = styled.div<{ isExpanded: boolean }>`
  margin-top: 0.8rem;
  border: ${({ theme, isExpanded }) => (isExpanded ? `1px solid ${theme.border2}` : `1px solid ${theme.bg1}`)};
`

const SecondaryLabel = styled.div`
  color: ${({ theme }) => theme.text3};
  font-size: 0.7rem;
`

const Date = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 0.8rem;
  margin: 0rem 0rem 0.25rem 0.25rem;
`

const FeeToolTip = styled(ReactTooltip)`
  color: ${({ theme }) => theme.bg0} !important;
  opacity: 1 !important;
  padding: 3px 7px !important;
  font-size: 0.6rem !important;
`

const SecondaryButton = styled(NavButton)`
  width: fit-content;
  align-self: center;
  margin-top: -0.5rem;
  font-size: 0.8rem;
`

interface TxGroup {
  [x: number]: Tx[]
}

function formatDate(date: string): string {
  return timestampToObject(parseInt(date)).format('MMMM DD, YYYY')
}

function formatTime(date: string): string {
  return timestampToObject(parseInt(date)).format('hh:mm A')
}

const collapseConfig = {
  duration: 300,
}

const ITEMS_PER_OFFSET = 1

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

  // group txs based on txs in a single day
  const groupedTransactions: Array<Tx[]> = useMemo(() => {
    const txs = transactions.reduce((arr: TxGroup, tx) => {
      const id = Math.floor(parseInt(tx.timestamp) / 86400)
      if (!arr[id]) arr[id] = []
      arr[id].push(tx)
      return arr
    }, {})
    return Object.values(txs)
  }, [transactions])

  const paginatedTransactions = useMemo(() => {
    return groupedTransactions.slice(0, offset * ITEMS_PER_OFFSET + ITEMS_PER_OFFSET)
  }, [groupedTransactions, offset])

  const showLoadMore = useMemo(() => {
    return paginatedTransactions.length !== groupedTransactions.length
  }, [paginatedTransactions])

  useEffect(() => {
    setOffset(0)
  }, [chainId, account])

  const onLoadMore = () => {
    setOffset((prev) => (prev += 1))
  }

  if (!account || !chainId || !paginatedTransactions.length) {
    return null
  }

  return (
    <>
      <div style={{ margin: '15px 0' }}>Trade History</div>
      <Wrapper border={isJadeTheme}>
        {/* TODO : Have a search bar here to filter the trades of a particular Registrar */}
        {paginatedTransactions.map((txArr) => (
          <>
            <Date>{formatDate(txArr[0].timestamp)}</Date>
            <Box>
              {txArr.map((tx, index) => (
                <TransactionRow tx={tx} key={index} isNotLastRow={index !== txArr.length - 1} />
              ))}
            </Box>
          </>
        ))}
        {showLoadMore && <SecondaryButton onClick={onLoadMore}>Show more trades</SecondaryButton>}
      </Wrapper>
    </>
  )
}

function TransactionRow({ tx, isNotLastRow }: { tx: Tx; isNotLastRow: boolean }) {
  const { chainId } = useWeb3React()
  const theme = useTheme()
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse(collapseConfig)

  const tickerLogo = useCurrencyLogo(tx.registrar.ticker, undefined)
  const deiLogo = useCurrencyLogo(undefined, 'DEI')

  const { amountIn, amountOut, txHash, fee, feeToolTip, method, tickerIn, tickerOut, logoIn, logoOut, price, color } =
    useMemo(() => {
      const base = {
        amountIn: tx.amountIn.slice(0, 8),
        amountOut: tx.amountOut.slice(0, 8),
        txHash: truncateHash(tx.id),
        fee: Number(tx.daoFee) + Number(tx.partnerFee),
        feeToolTip: 'DEUS Dao Fee: ' + tx.daoFee + '<br/> Partner Fee: ' + tx.partnerFee,
      }
      if (tx.method === 'open') {
        return {
          ...base,
          method: 'Buy',
          tickerIn: 'DEI',
          tickerOut: tx.registrar.symbol,
          logoIn: deiLogo,
          logoOut: tickerLogo,
          color: 'green',
          price: tx.price,
        }
      }
      return {
        ...base,
        method: 'Sell',
        tickerIn: tx.registrar.symbol,
        tickerOut: 'DEI',
        logoIn: tickerLogo,
        logoOut: deiLogo,
        price: tx.price,
        color: 'red',
      }
    }, [tx, deiLogo, tickerLogo])

  const getPriceOrValueLabel = useCallback(
    (ticker: string) => {
      if (ticker === 'DEI') {
        return <SecondaryLabel>At {formatDollarAmount(Number(price))}</SecondaryLabel>
      }
      const amount = tx.method === 'open' ? amountOut : amountIn
      return <SecondaryLabel>{formatDollarAmount(Number(price) * Number(amount))}</SecondaryLabel>
    },
    [price, amountIn, amountOut, tx]
  )

  if (!chainId) {
    return null
  }

  return (
    <TransactionRecord className="collapsible" isExpanded={isExpanded}>
      <TransactionHeader className="header" {...getToggleProps()}>
        <CellWrapper flex={'0 0 20%'}>
          <ActionIconWrapper>
            <Repeat size={15} color={color} />
          </ActionIconWrapper>
          <ActionDetailsWrapper>
            <div>{method}</div>
            <SecondaryLabel>{formatTime(tx.timestamp)}</SecondaryLabel>
          </ActionDetailsWrapper>
        </CellWrapper>
        <CellWrapper flex={'0 0 35%'}>
          <ActionIconWrapper>
            <ImageWithFallback src={logoIn} alt={`${tickerIn} Logo`} width={18} height={18} />
          </ActionIconWrapper>
          <ActionDetailsWrapper>
            <div>
              {amountIn} {tickerIn}
            </div>
            {getPriceOrValueLabel(tickerIn)}
          </ActionDetailsWrapper>
        </CellWrapper>
        <CellWrapper flex={'0 0 10%'}>
          <ArrowRight size={20} strokeWidth={1} />
        </CellWrapper>
        <CellWrapper flex={'0 0 35%'}>
          <ActionIconWrapper>
            <ImageWithFallback src={logoOut} alt={`${tickerOut} Logo`} width={18} height={18} />
          </ActionIconWrapper>
          <ActionDetailsWrapper>
            <div>
              {amountOut} {tickerOut}
            </div>
            {getPriceOrValueLabel(tickerOut)}
          </ActionDetailsWrapper>
        </CellWrapper>
      </TransactionHeader>
      <div {...getCollapseProps()}>
        <TransactionContent className="content">
          <Divider isExpanded={isExpanded} />
          <TransactionContentWrapper>
            <CellWrapper flex={'0 0 50%'}>
              <ActionDetailsWrapper>
                <FeeToolTip
                  id="fee"
                  place="right"
                  type="info"
                  effect="solid"
                  multiline
                  backgroundColor={theme.border1}
                />
                <div>Fee</div>
                <SecondaryLabel data-for="fee" data-tip={feeToolTip}>
                  ${fee.toPrecision(2)}
                  <Info size={10} color={theme.text2} style={{ marginLeft: '0.25rem' }} />
                </SecondaryLabel>
              </ActionDetailsWrapper>
            </CellWrapper>
            <CellWrapper flex={'0 0 50%'}>
              <ActionDetailsWrapper>
                <div>Transaction Hash</div>
                <SecondaryLabel>
                  {txHash}
                  <ExternalLink
                    href={getExplorerLink(chainId, ExplorerDataType.TRANSACTION, tx.id)}
                    style={{ marginLeft: '0.25rem' }}
                  >
                    <ExtLink size={12} color={theme.text2} />
                  </ExternalLink>
                </SecondaryLabel>
              </ActionDetailsWrapper>
            </CellWrapper>
          </TransactionContentWrapper>
        </TransactionContent>
      </div>
      {!isExpanded && isNotLastRow ? <Divider isExpanded={isExpanded} /> : <div style={{ marginBottom: '0.8rem' }} />}
    </TransactionRecord>
  )
}
