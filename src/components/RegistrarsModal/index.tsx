import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import memoize from 'memoize-one'
import { FixedSizeList as List, areEqual } from 'react-window'
import Fuse from 'fuse.js'
import { useSelect, SelectSearchOption } from 'react-select-search'
import AutoSizer from 'react-virtualized-auto-sizer'
import { isMobile } from 'react-device-detect'
import isEmpty from 'lodash/isEmpty'
import { Registrar } from 'lib/synchronizer'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useIsDedicatedTheme } from 'hooks/useTheme'
import { useActiveBalances } from 'state/portfolio/hooks'
import { useLongRegistrars } from 'lib/synchronizer/hooks'

import { FALLBACK_CHAIN_ID } from 'constants/chains'

import { MobileModal, Modal, ModalHeader } from 'components/Modal'
import ImageWithFallback from 'components/ImageWithFallback'

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
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 1rem;
  `};

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

const RegistrarRow = ({ data, index, style }: { data: any; index: number; style: React.CSSProperties }) => {
  const { items, onClick, optionProps } = data
  const registrar = items[index] as unknown as Registrar
  const logo = useCurrencyLogo(registrar.id, undefined)
  const balances = useActiveBalances()
  const [loading, setLoading] = useState(true)

  const balance = useMemo(() => {
    if (!registrar || isEmpty(balances) || !(registrar.contract in balances)) return 0
    return balances[registrar.contract].balance
  }, [registrar, balances])

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <Row
      onClick={onClick}
      onMouseDown={(evt) => {
        onClick(registrar.contract)
        optionProps.onMouseDown(evt)
      }}
      style={style}
    >
      <ImageWithFallback src={logo} width={30} height={30} alt={`${registrar.symbol}`} round loading={loading} />
      <NameWrapper>
        <div>{registrar.id}</div>
        <div>{registrar.name}</div>
      </NameWrapper>
      <div>{balance}</div>
    </Row>
  )
}

const MemoRegistrarRow = React.memo(RegistrarRow, areEqual)

const createItemData = memoize((items: SelectSearchOption[], onClick: (registrarId?: string) => void, optionProps) => ({
  items,
  onClick,
  optionProps,
}))

export default function RegistrarsModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  return isOpen ? <ActiveRegistrarsModal isOpen={isOpen} onDismiss={onDismiss} /> : null
}

function ActiveRegistrarsModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  const registrarList = useLongRegistrars(FALLBACK_CHAIN_ID) // this prevents us from showing [] with an unknown chain
  const router = useRouter()
  const isDedicatedTheme = useIsDedicatedTheme()

  const registrars: SelectSearchOption[] = useMemo(() => {
    return registrarList.map((o) => ({ ...o, value: o.contract }))
  }, [registrarList])

  const [snapshot, searchProps, optionProps] = useSelect({
    options: registrars,
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
    (registrarId?: string) => {
      searchProps.onBlur()
      onDismiss()
      registrarId && router.push(buildUrl(`trade?registrarId=${registrarId}`))
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
            placeholder="Search for a stock, crypto or forex currency..."
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
                  {MemoRegistrarRow}
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
