import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { ArrowRight, Repeat, ExternalLink as ExtLink, Info } from 'react-feather'
import useCollapse from 'react-collapsed'
import ReactTooltip from 'react-tooltip'

import { getApolloClient } from 'apollo/client/synchronizer'
import { TRANSACTIONS, Tx } from 'apollo/queries'

import { timestampToObject } from 'utils/time'
import { ExplorerDataType, getExplorerLink } from 'utils/explorers'
import { truncateHash } from 'utils/account'
import { formatDollarAmount } from 'utils/numbers'

import useWeb3React from 'hooks/useWeb3'
import { useIsJadeTheme } from 'hooks/useTheme'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'
import ImageWithFallback from 'components/ImageWithFallback'
import { NavButton } from 'components/Button'

const Wrapper = styled(Card)<{
  border?: boolean
}>`
  border: ${({ theme, border }) => (border ? `1px solid ${theme.border2}` : 'none')};
  padding: 0.8rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.5rem;
  `}
`

const Header = styled.div`
  margin: 1rem 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0.5rem 0;
  `}
`

const Box = styled.div`
  display: flex;
  flex-flow: column nowrap;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border2};
  margin: 0.25rem 0rem 1rem 0rem;
  padding: 0.25rem;
`

const TransactionRecord = styled.div<{
  isExpanded: boolean
}>`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding-top: 0.8rem;
  border: ${({ theme, isExpanded }) => (isExpanded ? `1px solid ${theme.border1}` : 'none')};
  border-radius: ${({ isExpanded }) => (isExpanded ? `10px` : `0px`)};
  margin-bottom: ${({ isExpanded }) => (isExpanded ? `0.25rem` : `0px`)};
  transition: all 0.5s ease;

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
  justify-content: space-between;
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
  flex: ${({ flex }) => flex ?? 'none'};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    #details {
      display: none !important;
    }
  `}
`

export const ResponsiveCellWrapper = styled(CellWrapper)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
  `}
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

const PrimaryLabel = styled.div`
  font-size: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.7rem;
  `}
`

const SecondaryLabel = styled.div`
  display: flex;
  color: ${({ theme }) => theme.text3};
  font-size: 0.7rem;
  align-items: center;
  text-align: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.6rem;
  `}
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.7rem;
  `}
`

const HelperText = styled.div`
  display: flex;
  align-self: center;
  font-size: 12.5px;
  color: ${({ theme }) => theme.text1};

  & > span {
    color: ${({ theme }) => theme.primary3};
    &:hover {
      cursor: pointer;
    }
  }
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

const ITEMS_PER_OFFSET = 10

interface PaginatedReducer {
  groups: Tx[][]
  count: 0
}

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
    const flat: Tx[][] = Object.values(txs)
    return flat.sort((arr1, arr2) => (Number(arr1[0].timestamp) > Number(arr2[0].timestamp) ? -1 : 1))
  }, [transactions])

  // only show an N amount of transactions for every click on 'showLoadMore'
  const paginatedTransactions = useMemo(() => {
    const currentMaximum = offset * ITEMS_PER_OFFSET + ITEMS_PER_OFFSET
    const result = groupedTransactions.reduce(
      (acc: PaginatedReducer, group) => {
        if (acc.count >= currentMaximum) return acc
        acc.groups.push(group)
        acc.count += group.length
        return acc
      },
      {
        groups: [],
        count: 0,
      }
    )
    return result.groups
  }, [groupedTransactions, offset])

  const showLoadMore = useMemo(() => {
    return paginatedTransactions.length !== groupedTransactions.length
  }, [paginatedTransactions, groupedTransactions])

  useEffect(() => {
    setOffset(0)
  }, [chainId, account])

  const onLoadMore = () => {
    setOffset((prev) => (prev += 1))
  }

  if (!account || !chainId) {
    return null
  }

  return (
    <>
      <Header>Trade History</Header>
      <Wrapper border={isJadeTheme}>
        {/* TODO : Have a search bar here to filter the trades of a particular Registrar */}
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((txArr) => (
            <>
              <Date>{formatDate(txArr[0].timestamp)}</Date>
              <Box>
                {txArr.map((tx, index) => (
                  <TransactionRow tx={tx} key={index} isNotLastRow={index !== txArr.length - 1} />
                ))}
              </Box>
            </>
          ))
        ) : (
          <HelperText>You don&apos;t have any trade history.</HelperText>
        )}
        {showLoadMore && <SecondaryButton onClick={onLoadMore}>Show more trades</SecondaryButton>}
      </Wrapper>
    </>
  )
}

function TransactionRow({ tx, isNotLastRow }: { tx: Tx; isNotLastRow: boolean }) {
  const { chainId } = useWeb3React()
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse(collapseConfig)

  const tickerLogo = useCurrencyLogo(tx.registrar.ticker, undefined)
  const deiLogo = useCurrencyLogo(undefined, 'DEI')

  const {
    amountIn,
    amountOut,
    txHash,
    fee,
    feeToolTip,
    method,
    tickerIn,
    tickerOut,
    logoIn,
    logoOut,
    priceIn,
    priceOut,
    color,
  } = useMemo(() => {
    const base = {
      amountIn: tx.amountIn.slice(0, 8),
      amountOut: tx.amountOut.slice(0, 8),
      txHash: tx.id,
      fee: Number(tx.daoFee) + Number(tx.partnerFee),
      feeToolTip:
        'DEUS Dao Fee: ' +
        formatDollarAmount(Number(tx.daoFee), 3) +
        '<br/> Partner Fee: ' +
        formatDollarAmount(Number(tx.partnerFee), 3),
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
        priceIn: '1',
        priceOut: tx.price,
      }
    }
    return {
      ...base,
      method: 'Sell',
      tickerIn: tx.registrar.symbol,
      tickerOut: 'DEI',
      logoIn: tickerLogo,
      logoOut: deiLogo,
      priceIn: tx.price,
      priceOut: '1',
      color: 'red',
    }
  }, [tx, deiLogo, tickerLogo])

  const { basePrice, baseTicker } = useMemo(() => {
    return {
      basePrice: priceIn === '1' ? priceOut : priceIn,
      baseTicker: tickerIn === 'DEI' ? tickerOut : tickerIn,
    }
  }, [priceIn, priceOut, tickerIn, tickerOut])

  function getPriceLabel(amount: string, ticker: string, price: string) {
    if (ticker === 'DEI') {
      return <PrimaryLabel>{amount} USD</PrimaryLabel>
    }
    return (
      <>
        <PrimaryLabel>
          {amount} {ticker}
        </PrimaryLabel>
        <SecondaryLabel id="details">{formatDollarAmount(Number(price))}</SecondaryLabel>
      </>
    )
  }

  if (!chainId) {
    return null
  }

  return (
    <div className="collapsible">
      <TransactionRecord isExpanded={isExpanded} {...getToggleProps()}>
        <TransactionHeader className="header">
          <CellWrapper flex={'0 0 20%'}>
            <ActionIconWrapper>
              <Repeat size={15} color={color} />
            </ActionIconWrapper>
            <ActionDetailsWrapper>
              <PrimaryLabel>{method}</PrimaryLabel>
              <SecondaryLabel id="details">{formatTime(tx.timestamp)}</SecondaryLabel>
            </ActionDetailsWrapper>
          </CellWrapper>
          <CellWrapper flex={'0 0 35%'}>
            <ActionIconWrapper>
              <ImageWithFallback src={logoIn} alt={`${tickerIn} Logo`} width={18} height={18} />
            </ActionIconWrapper>
            <ActionDetailsWrapper>{getPriceLabel(amountIn, tickerIn, priceIn)}</ActionDetailsWrapper>
          </CellWrapper>
          <CellWrapper flex={'0 0 10%'}>
            <ArrowRight size={20} strokeWidth={1} />
          </CellWrapper>
          <CellWrapper flex={'0 0 35%'}>
            <ActionIconWrapper>
              <ImageWithFallback src={logoOut} alt={`${tickerOut} Logo`} width={18} height={18} />
            </ActionIconWrapper>
            <ActionDetailsWrapper>{getPriceLabel(amountOut, tickerOut, priceOut)}</ActionDetailsWrapper>
          </CellWrapper>
        </TransactionHeader>
        <div {...getCollapseProps()}>
          <CollapsedInformation
            isExpanded={isExpanded}
            fee={fee}
            price={basePrice}
            ticker={baseTicker}
            feeToolTip={feeToolTip}
            txHash={txHash}
          />
        </div>
        {!isExpanded && isNotLastRow ? <Divider isExpanded={isExpanded} /> : <div style={{ marginBottom: '0.8rem' }} />}
      </TransactionRecord>
    </div>
  )
}

function CollapsedInformation({
  isExpanded,
  fee,
  price,
  ticker,
  feeToolTip,
  txHash,
}: {
  isExpanded: boolean
  fee: number
  price: string
  ticker: string
  feeToolTip: string
  txHash: string
}) {
  const theme = useTheme()
  const { chainId } = useWeb3React()

  if (!chainId) {
    return null
  }

  return (
    <>
      <TransactionContent className="content">
        <Divider isExpanded={isExpanded} />
        <TransactionContentWrapper>
          <CellWrapper flex={'0 0 25%'}>
            <ActionDetailsWrapper>
              <FeeToolTip id="fee" place="right" type="info" effect="solid" multiline backgroundColor={theme.border1} />
              <PrimaryLabel>Fee</PrimaryLabel>
              <SecondaryLabel data-for="fee" data-tip={feeToolTip}>
                {formatDollarAmount(fee, 3)}
                <Info size={10} color={theme.text2} style={{ marginLeft: '0.25rem' }} />
              </SecondaryLabel>
            </ActionDetailsWrapper>
          </CellWrapper>
          <ResponsiveCellWrapper flex={'0 0 25%'}>
            <ActionDetailsWrapper>
              <PrimaryLabel>Price</PrimaryLabel>
              <SecondaryLabel>
                {formatDollarAmount(Number(price))} / {ticker}
              </SecondaryLabel>
            </ActionDetailsWrapper>
          </ResponsiveCellWrapper>
          <CellWrapper style={{ marginLeft: 'auto' }}>
            <ActionDetailsWrapper>
              <PrimaryLabel>Transaction Hash</PrimaryLabel>
              <ExternalLink href={getExplorerLink(chainId, ExplorerDataType.TRANSACTION, txHash)}>
                <SecondaryLabel>
                  {truncateHash(txHash)}
                  <ExtLink size={12} color={theme.text2} style={{ marginLeft: '0.25rem' }} />
                </SecondaryLabel>
              </ExternalLink>
            </ActionDetailsWrapper>
          </CellWrapper>
        </TransactionContentWrapper>
      </TransactionContent>
    </>
  )
}
