import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { SectorButton, useSearch, InputField, Table } from 'components/App/Markets'
import { ChainInfo } from 'constants/chainInfo'
import { SubAsset } from 'hooks/useAssetList'
import { Modal, ModalHeader } from 'components/Modal'
import { useRouter } from 'next/router'
import useWeb3React from 'hooks/useWeb3'
import { PrimaryButton } from 'components/Button'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useWalletModalToggle } from 'state/application/hooks'
import { IconWrapper, Loader } from 'components/Icons'
import { Sectors } from 'state/details/reducer'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 0 auto;
  margin-top: 75px;
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
  const [selectedSector, setSelectedSector] = useState(Sectors[0])

  const [showModal, setShowModal] = useState(false)
  const [modalAsset, setModalAsset] = useState<SubAsset>()
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
      return `/trade?assetId=${contract}&${queryString}`
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
    (asset: SubAsset) => {
      if (!chainId) {
        setModalAsset(asset)
        setShowModal(true)
      } else {
        router.push(buildUrl(asset.contract))
      }
    },
    [chainId, router, buildUrl]
  )

  useEffect(() => {
    if (navigateReady && modalAsset) {
      router.push(buildUrl(modalAsset.contract)).then(() => setNavigateReady(false))
    }
  }, [navigateReady, modalAsset, buildUrl, router])

  function onDismiss() {
    setShowModal(false)
  }

  function getNetworkReference() {
    return chainId && chainId in ChainInfo ? ChainInfo[chainId]['label'] : 'wrong'
  }

  function getModalContent() {
    if (!modalAsset) return null

    if (!chainId || !account) {
      return (
        <>
          <div>
            You&apos;re not connected to a wallet. In order to trade {modalAsset.ticker} on the{' '}
            <Label>{ChainInfo[modalAsset.chainId]['label']}</Label> network you have to connect your wallet first.
          </div>
          <PrimaryButton onClick={walletToggle}>Connect Wallet</PrimaryButton>
        </>
      )
    }

    return (
      <>
        {chainId !== modalAsset.chainId && (
          <div>
            You&apos;re currently connected to the <Label warning>{getNetworkReference()}</Label> network. In order to
            trade ${modalAsset.ticker} on the <Label>{ChainInfo[modalAsset.chainId]['label']}</Label> network you have
            to switch chains first.
          </div>
        )}
        {window.web3 && window.ethereum && (
          <PrimaryButton
            onClick={async () => {
              const success = await rpcChangerCallback(modalAsset.chainId)
              if (success) {
                setChainHasSwitched(true)
                // give the rpc a small amount of time to catch up, else /trade will render an empty asset
                await new Promise((resolve) => setTimeout(resolve, 1500))
                setNavigateReady(true)
              }
            }}
          >
            {!chainHasSwitched ? (
              <div>Switch to {ChainInfo[modalAsset.chainId]['label']}</div>
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
        <ModalHeader title={modalAsset?.name} onClose={onDismiss} />
        <ModalContent>{getModalContent()}</ModalContent>
      </Modal>
      <SectorRow>
        {Sectors.map((sector, index) => (
          <SectorButton key={index} active={sector == selectedSector} onClick={() => setSelectedSector(sector)}>
            {sector}
          </SectorButton>
        ))}
      </SectorRow>
      <InputField searchProps={searchProps} />
      <Table options={snapshot.options as unknown as SubAsset[]} onSelect={onSelect} />
    </Container>
  )
}
