import React, { useMemo } from 'react'
import styled from 'styled-components'
import { FixedSizeList as List } from 'react-window'
import Fuse from 'fuse.js'
import { useSelect, SelectSearchOption } from 'react-select-search'
import AutoSizer from 'react-virtualized-auto-sizer'
import { isMobile } from 'react-device-detect'

import { SubAsset, useLongAssetsList } from 'hooks/useAssetList'
import { useCurrency } from 'hooks/useCurrency'
import useWeb3React from 'hooks/useWeb3'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useDefaultsFromURL from 'state/trade/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { MobileModal, Modal, ModalHeader } from 'components/Modal'
import ImageWithFallback from 'components/ImageWithFallback'
import { Loader } from 'components/Icons'

const SearchWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  background: ${({ theme }) => theme.bg1};
  border-radius: 10px;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.secondary1};
  padding: 0 0.8rem;
  margin: 10px;
`

const ListWrapper = styled.div`
  width: 100%;
  height: 400px;
`

const InputField = styled.input<{
  [x: string]: any
}>`
  height: 40px;
  flex: 1;
  text-align: left;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text1};

  &:focus,
  &:hover {
    outline: none;
  }
`

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

function fuzzySearch(options: SelectSearchOption[]): any {
  const config = {
    keys: ['ticker', 'name'],
    isCaseSensitive: false,
    threshold: 0.2,
  }

  const fuse = new Fuse(options, config)

  return (query: string) => {
    if (!query) {
      return options
    }

    const result = fuse.search(query)
    return result.map((o) => o.item)
  }
}

export default function AssetsModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const assetList = useLongAssetsList()
  const { setURLCurrency } = useDefaultsFromURL()

  const assets: SelectSearchOption[] = useMemo(() => {
    return assetList.map((o) => ({ ...o, value: o.contract }))
  }, [assetList])

  const [snapshot, searchProps, optionProps] = useSelect({
    options: assets,
    value: '',
    search: true,
    filterOptions: fuzzySearch,
    allowEmpty: true,
  })

  const onDismissProxy = () => {
    searchProps.onBlur()
    onDismiss()
  }

  function getModalContent() {
    return (
      <>
        <ModalHeader title="Select an asset" onClose={onDismissProxy} />
        <SearchWrapper>
          <InputField
            {...searchProps}
            title="Search a ticker"
            autoFocus
            type="text"
            placeholder="Search for a stock or crypto..."
            spellCheck="false"
            onBlur={() => null}
          />
        </SearchWrapper>
        <ListWrapper>
          <AutoSizer>
            {({ height, width }) => {
              return (
                <List
                  width={width}
                  height={height}
                  itemCount={snapshot.options.length}
                  itemSize={50}
                  itemData={snapshot.options}
                >
                  {({ data, index, style }) => {
                    const asset = data[index] as unknown as SubAsset
                    return (
                      <AssetRow
                        key={index}
                        asset={asset}
                        style={style}
                        onClick={() => {
                          setURLCurrency(asset.contract)
                          onDismissProxy()
                        }}
                        {...optionProps}
                      />
                    )
                  }}
                </List>
              )
            }}
          </AutoSizer>
        </ListWrapper>
      </>
    )
  }

  return isMobile ? (
    <MobileModal isOpen={isOpen} onBackgroundClick={onDismiss} onEscapeKeydown={onDismiss}>
      {getModalContent()}
    </MobileModal>
  ) : (
    <Modal isOpen={isOpen} onBackgroundClick={onDismiss} onEscapeKeydown={onDismiss}>
      {getModalContent()}
    </Modal>
  )
}

const AssetRow = ({
  asset,
  onClick,
  style,
  ...rest
}: {
  asset: SubAsset
  onClick: () => void
  style: React.CSSProperties
  [x: string]: any
}) => {
  const { account } = useWeb3React()
  const currency = useCurrency(asset.contract)
  const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const logo = useCurrencyLogo(asset.id, undefined)

  return (
    <Row
      onClick={onClick}
      style={style}
      onMouseDown={(evt) => {
        onClick()
        rest.onMouseDown(evt)
      }}
    >
      <ImageWithFallback src={logo} width={30} height={30} alt={`${asset.symbol}`} round />
      <NameWrapper>
        <div>{asset.id}</div>
        <div>{asset.name}</div>
      </NameWrapper>
      {balance ? <div>{balance?.toSignificant(6)}</div> : <Loader size="12px" duration={'3s'} />}
    </Row>
  )
}
