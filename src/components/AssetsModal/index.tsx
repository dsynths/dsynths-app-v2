import React from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { FixedSizeList as List } from 'react-window'

import { SubAsset, useLongAssetsList } from 'hooks/useAssetList'
import { useCurrency } from 'hooks/useCurrency'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { Modal, ModalHeader } from 'components/Modal'
import ImageWithFallback from 'components/ImageWithFallback'
import useWeb3React from 'hooks/useWeb3'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useDefaultsFromURL from 'state/trade/hooks'
import { Loader } from 'components/Icons'

const OverflowWrapper = styled.div``

// const List = styled(FixedSizeList)`
//   // height: 100%;
//   // position: relative;
//   // overflow: scroll;
//   // -webkit-overflow-scrolling: touch;
// `

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 1rem;
  align-items: center;
  width: 100%;
  height: 50px;
  padding: 0.5rem 1rem;
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
  & > * {
    &:last-child {
      font-size: 0.8rem;
      margin-left: auto;
      color: ${({ theme }) => theme.text2};
    }
  }
`

const NameWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  & > * {
    &:first-child {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.text1};
    }
    &:last-child {
      font-size: 0.7rem;
      color: ${({ theme }) => theme.text2};
    }
  }
`

const AssetRow = ({
  asset,
  loading,
  onDismiss,
  style,
}: {
  asset: SubAsset
  loading?: boolean
  onDismiss: () => void
  style: React.CSSProperties
}) => {
  const { account } = useWeb3React()
  const currency = useCurrency(asset.contract)
  const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const logo = useCurrencyLogo(asset.id, currency?.symbol)
  const { setURLCurrency } = useDefaultsFromURL()

  return (
    <Row
      onClick={() => {
        setURLCurrency(asset.contract)
        onDismiss()
      }}
      style={style}
    >
      <ImageWithFallback src={logo} width={30} height={30} alt={`${asset.symbol}`} />
      <NameWrapper>
        <div>{asset.symbol}</div>
        <div>{asset.name}</div>
      </NameWrapper>
      {balance ? <div>{balance?.toSignificant(6)}</div> : <Loader size="12px" duration={'3s'} />}
    </Row>
  )
}

export default function AssetsModal({
  isOpen,
  onDismiss,
  activeCurrency,
}: {
  isOpen: boolean
  onDismiss: () => void
  activeCurrency: Currency | undefined
}) {
  const assetList = useLongAssetsList()

  return (
    <Modal isOpen={isOpen} onBackgroundClick={onDismiss} onEscapeKeydown={onDismiss} width="350px">
      <ModalHeader title="Select an asset" onClose={onDismiss} />
      <OverflowWrapper>
        <List
          width={350}
          height={400}
          itemCount={assetList.length}
          itemSize={50}
          initialScrollOffset={0}
          itemData={assetList}
        >
          {({ data, index, style }) => {
            const asset = data[index]
            return <AssetRow key={index} asset={asset} onDismiss={onDismiss} style={style} />
          }}
        </List>
      </OverflowWrapper>
    </Modal>
  )
}
