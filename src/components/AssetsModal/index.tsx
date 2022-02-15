import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import memoize from 'memoize-one'
import { FixedSizeList as List, areEqual } from 'react-window'
import Fuse from 'fuse.js'
import { useSelect, SelectSearchOption } from 'react-select-search'
import AutoSizer from 'react-virtualized-auto-sizer'
import { isMobile } from 'react-device-detect'
import isEmpty from 'lodash/isEmpty'

import { SubAsset, useLongAssetsList } from 'hooks/useAssetList'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import { MobileModal, Modal, ModalHeader } from 'components/Modal'
import ImageWithFallback from 'components/ImageWithFallback'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { useRouter } from 'next/router'
import { useIsDedicatedTheme } from 'hooks/useTheme'
import { useActiveBalances } from 'state/portfolio/hooks'

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

const ListWrapper = styled.div<{
  isMobile: boolean
}>`
  width: 100%;
  height: ${({ isMobile }) => (isMobile ? '80vh' : '400px')};
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

const AssetRow = ({ data, index, style }: { data: any; index: number; style: React.CSSProperties }) => {
  const { items, onClick, optionProps } = data
  const asset = items[index] as unknown as SubAsset
  const logo = useCurrencyLogo(asset.id, undefined)
  const balances = useActiveBalances()
  const [loading, setLoading] = useState(true)

  const balance = useMemo(() => {
    if (!asset || isEmpty(balances) || !(asset.contract in balances)) return 0
    return balances[asset.contract].balance
  }, [asset, balances])

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <Row
      onClick={onClick}
      onMouseDown={(evt) => {
        onClick(asset.contract)
        optionProps.onMouseDown(evt)
      }}
      style={style}
    >
      <ImageWithFallback src={logo} width={30} height={30} alt={`${asset.symbol}`} round loading={loading} />
      <NameWrapper>
        <div>{asset.id}</div>
        <div>{asset.name}</div>
      </NameWrapper>
      <div>{balance}</div>
    </Row>
  )
}

const MemoAssetRow = React.memo(AssetRow, areEqual)

const createItemData = memoize((items: SelectSearchOption[], onClick: (assetId?: string) => void, optionProps) => ({
  items,
  onClick,
  optionProps,
}))

export default function AssetsModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  return isOpen ? <ActiveAssetsModal isOpen={isOpen} onDismiss={onDismiss} /> : null
}

function ActiveAssetsModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const assetList = useLongAssetsList(FALLBACK_CHAIN_ID)
  const router = useRouter()
  const isDedicatedTheme = useIsDedicatedTheme()

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

  const buildUrl = useCallback(
    (path: string) => {
      return isDedicatedTheme ? `/${path}&theme=${router.query.theme}` : `/${path}`
    },
    [router, isDedicatedTheme]
  )

  const onClick = useCallback(
    (assetId?: string) => {
      searchProps.onBlur()
      onDismiss()
      assetId && router.push(buildUrl(`trade?assetId=${assetId}`))
    },
    [router, onDismiss, searchProps, buildUrl]
  )

  function getModalContent() {
    return (
      <>
        <ModalHeader title="Select an asset" onClose={onClick} />
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
        <ListWrapper isMobile={isMobile}>
          <AutoSizer>
            {({ height, width }) => {
              const itemData = createItemData(snapshot.options, onClick, optionProps)
              return (
                <List
                  width={width}
                  height={height}
                  itemCount={snapshot.options.length}
                  itemSize={50}
                  itemData={itemData}
                  overscanCount={20}
                >
                  {MemoAssetRow}
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
