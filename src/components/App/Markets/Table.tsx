import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { SubAsset } from 'hooks/useAssetList'
import Pagination from './Pagination'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import ImageWithFallback from 'components/ImageWithFallback'
import { formatDollarAmount } from 'utils/numbers'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  min-height: 350px; /* hardcoded because a non-complete page will shift the height */
`

const TableWrapper = styled.table`
  width: 100%;
  overflow: hidden;
  table-layout: fixed;
  border-collapse: collapse;
`

const Head = styled.thead`
  & > tr {
    height: 29px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text3};
  }
`

const Row = styled.tr`
  align-items: center;
  height: 21px;
  font-size: 0.8rem;
  line-height: 0.8rem;
  overflow: hidden;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};

  :hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
`

const Cel = styled.td<{
  justify?: boolean
}>`
  text-align: left;
  text-overflow: ellipsis;
  align-items: center;
  padding: 5px;

  :first-child {
    width: 60px;
  }

  :nth-child(2) {
    width: 70px;
  }

  :last-child {
    width: 100px;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    :first-child {
      width: 40px;
    }
    :last-child {
      display: none;
    }
  `}
`

const ImageWrapper = styled.div`
  width: 30px;
`

export default function Table({ options, onSelect }: { options: SubAsset[]; onSelect: (asset: SubAsset) => void }) {
  const itemsPerPage = 10
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(0)
  }, [options])

  const paginatedOptions = useMemo(() => {
    return options.slice(offset, offset + itemsPerPage)
  }, [options, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(options.length / itemsPerPage)
  }, [options])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel></Cel>
            <Cel>Symbol</Cel>
            <Cel>Name</Cel>
            <Cel style={{ textAlign: 'right' }}>Price</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((asset: SubAsset, index) => <TableRow key={index} asset={asset} onSelect={onSelect} />)
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                No Results Found
              </td>
            </tr>
          )}
        </tbody>
      </TableWrapper>
      {paginatedOptions.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
    </Wrapper>
  )
}

function TableRow({ asset, onSelect }: { asset: SubAsset; onSelect: (asset: SubAsset) => void }) {
  const logo = useCurrencyLogo(asset.id, undefined)

  const price = useMemo(() => {
    return parseInt(asset.price) ? formatDollarAmount(Number(asset.price), 2, false) : 'Market Closed'
  }, [asset])

  return (
    <Row onClick={() => onSelect(asset)}>
      <Cel>
        <ImageWrapper>
          <ImageWithFallback src={logo} width={30} height={30} alt={`${asset.symbol}`} round />
        </ImageWrapper>
      </Cel>
      <Cel>{asset.ticker}</Cel>
      <Cel>{asset.name}</Cel>
      <Cel style={{ textAlign: 'right' }}>{price}</Cel>
    </Row>
  )
}
