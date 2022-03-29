import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { Registrar, Sector } from 'lib/synchronizer'

import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { ChainInfo } from 'constants/chainInfo'

import { Modal, ModalHeader } from 'components/Modal'
import { SectorButton, useSearch, InputField, Table, TrendingMarkets, SynchroniserStats } from 'components/App/Markets'
import { IconWrapper, Loader } from 'components/Icons'
import { PrimaryButton } from 'components/Button'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 75px auto;
  width: clamp(250px, 80%, 800px);
  gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 30px;
  `}
`

const SectorRow = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 10px;
  margin-left: 10px;
`

const ModalContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 20px;
  padding: 20px;
`

const Label = styled.span<{
  warning?: boolean
}>`
  color: ${({ theme, warning }) => (warning ? theme.red1 : theme.primary3)};
`

export default function Markets() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()
  const [selectedSector, setSelectedSector] = useState(Sector.STOCKS)

  const [showModal, setShowModal] = useState(false)
  const [modalRegistrar, setModalRegistrar] = useState<Registrar>()
  const [chainHasSwitched, setChainHasSwitched] = useState(false)
  const [navigateReady, setNavigateReady] = useState(false)
  const { snapshot, searchProps } = useSearch(selectedSector)
  const rpcChangerCallback = useRpcChangerCallback()
  const walletToggle = useWalletModalToggle()

  const buildUrl = useCallback(
    (contract: string) => {
      const queryString = Object.keys(router.query)
        .map((key) => key + '=' + router.query[key])
        .join('&')
      return `/trade?registrarId=${contract}&${queryString}`
    },
    [router]
  )

  // handle external chain switches
  useEffect(() => {
    if (!chainHasSwitched) {
      setShowModal(false)
    }
  }, [chainHasSwitched, chainId])

  const onSelect = useCallback(
    (registrar: Registrar) => {
      if (!chainId) {
        setModalRegistrar(registrar)
        setShowModal(true)
      } else {
        router.push(buildUrl(registrar.contract))
      }
    },
    [chainId, router, buildUrl]
  )

  useEffect(() => {
    if (navigateReady && modalRegistrar) {
      router.push(buildUrl(modalRegistrar.contract)).then(() => setNavigateReady(false))
    }
  }, [navigateReady, modalRegistrar, buildUrl, router])

  const placeholder = useMemo(() => {
    const sector =
      selectedSector === Sector.STOCKS
        ? 'stock'
        : selectedSector === Sector.CRYPTO
        ? 'crypto'
        : 'commodity or forex currency'
    return `Search for a ${sector}...`
  }, [selectedSector])

  function onDismiss() {
    setShowModal(false)
  }

  function getNetworkReference() {
    return chainId && chainId in ChainInfo ? ChainInfo[chainId]['label'] : 'wrong'
  }

  function getModalContent() {
    if (!modalRegistrar) return null

    if (!chainId || !account) {
      return (
        <>
          <div>
            You&apos;re not connected to a wallet. In order to trade {modalRegistrar.ticker} on the{' '}
            <Label>{ChainInfo[modalRegistrar.chainId]['label']}</Label> network you have to connect your wallet first.
          </div>
          <PrimaryButton onClick={walletToggle}>Connect Wallet</PrimaryButton>
        </>
      )
    }

    return (
      <>
        {chainId !== modalRegistrar.chainId && (
          <div>
            You&apos;re currently connected to the <Label warning>{getNetworkReference()}</Label> network. In order to
            trade ${modalRegistrar.ticker} on the <Label>{ChainInfo[modalRegistrar.chainId]['label']}</Label> network
            you have to switch chains first.
          </div>
        )}
        {window.web3 && window.ethereum && (
          <PrimaryButton
            onClick={async () => {
              const success = await rpcChangerCallback(modalRegistrar.chainId)
              if (success) {
                setChainHasSwitched(true)
                // give the rpc a small amount of time to catch up, else /trade will render an empty registrar
                await new Promise((resolve) => setTimeout(resolve, 1500))
                setNavigateReady(true)
              }
            }}
          >
            {!chainHasSwitched ? (
              <div>Switch to {ChainInfo[modalRegistrar.chainId]['label']}</div>
            ) : (
              <>
                Redirecting
                <IconWrapper marginLeft="5px" style={{ transform: 'translateY(1px)' }}>
                  <Loader duration="3s" />
                </IconWrapper>
              </>
            )}
          </PrimaryButton>
        )}
      </>
    )
  }

  return (
    <Container>
      <Modal isOpen={showModal} onBackgroundClick={onDismiss} onEscapeKeydown={onDismiss} width="500px">
        <ModalHeader title={modalRegistrar?.name} onClose={onDismiss} />
        <ModalContent>{getModalContent()}</ModalContent>
      </Modal>
      <SynchroniserStats />
      <TrendingMarkets />
      <SectorRow>
        {(Object.keys(Sector) as (keyof typeof Sector)[]).map((sector, index) => {
          if (sector === Sector.COMMODITIES || sector === Sector.MISC) return null
          const sectorName = sector !== Sector.FOREX ? sector : 'FOREX / COMMODITIES'
          return (
            <SectorButton
              key={index}
              active={sector == selectedSector}
              onClick={() => setSelectedSector(Sector[sector])}
            >
              {sectorName}
            </SectorButton>
          )
        })}
      </SectorRow>
      <InputField searchProps={searchProps} placeholder={placeholder} />
      <Table options={snapshot.options as unknown as Registrar[]} onSelect={onSelect} />
    </Container>
  )
}
