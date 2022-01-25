import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Currency, ZERO } from '@sushiswap/core-sdk'
import { FixedSizeList as List } from 'react-window'

import { SubAsset, useSubAssetList } from 'hooks/useAssetList'
import useWeb3React from 'hooks/useWeb3'
import { useCurrency } from 'hooks/useCurrency'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useNetworkModalToggle } from 'state/application/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { Modal, ModalHeader } from 'components/Modal'
import { SynchronizerChains } from 'constants/chains'
import ImageWithFallback from 'components/ImageWithFallback'
import { Loader } from 'components/Icons'
import { Card } from 'components/Card'

const Wrapper = styled(Card)``

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

export default function Portfolio() {
  const { chainId, account } = useWeb3React()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [selectedAsset, setSelectedAsset] = useState<string>('') // asset contract

  const onDismiss = () => {
    setModalOpen(false)
  }

  /**
   * Toms design shows a crosschain portfolio but thats an issue with the Multicall hook.
   * You can do 2 things: 1) modify Multicall or whatever so u can fetch balance across all chains
   * or 2) fuck it and we stick to 1 chain unless the user switches network I RECOMMEND THIS OPTION
   *
   * It isn't worth the trouble imo because I will write subgraphs when I have time where user balance
   * for specifically stocks is indexed, so we dont even need to query onchain data + subgraphs are multichain
   * out of the box. So for now, go for option 2. Which impless we need a button for toggleNetworkModal
   */
  const toggleNetworkModal = useNetworkModalToggle()

  /**
   * Assets are divided into SubAssets. Each Asset has a long and a short version (with its own contract + own name etc)
   * so hence the SubAssets which are Assets but times 2 in size. We need balances for alllllllllll of them.
   * There are like a thousand assets or something btw.
   */
  const assetList = useSubAssetList()

  // Use this to display something or nothing (including a warning banner?)
  // Return a warning block or whatever if not supported chainId (we can work on content + styling later)
  const isSupportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return SynchronizerChains.includes(chainId)
  }, [chainId, account])

  /**
   * OKAY SO HERES THE ISSUE: the virtualized list requires scrolling to see balances
   * but we want to see ALL positive balances. Please study how state/wallet/hooks
   * works and pick a hook that can fetch the user balances for ALL contracts at once
   * and then ofcourse memo filter with balance?.greaterThan(ZERO)
   */

  // We use a virtualized List for a massive performance boost
  return (
    <>
      <Wrapper>
        <div>Title or something idk</div>
        <List
          width={450} // need a memo hook for the exact width for responsive modes
          height={400}
          itemCount={assetList.length}
          itemSize={50}
          initialScrollOffset={0}
          itemData={assetList}
        >
          {({ data, index, style }) => {
            const asset = data[index]
            return <AssetRow key={index} asset={asset} style={style} />
          }}
        </List>
      </Wrapper>
      <Modal isOpen={modalOpen} onBackgroundClick={onDismiss} onEscapeKeydown={onDismiss} width="300px">
        <ModalHeader title="Select an asset" onClose={onDismiss} border={false} />
        <div>This is the content for a single asset and with the buttons to trade it</div>
        <div>Just like Tom designed it. This is where the selectedContract param will have to shine!</div>
      </Modal>
    </>
  )
}

function AssetRow({ asset, style }: { asset: SubAsset; style: React.CSSProperties }) {
  const { account } = useWeb3React()
  const currency = useCurrency(asset.contract)
  const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const logo = useCurrencyLogo(asset.id, currency?.symbol)

  // again we dont want this,  only render an assetRow if the balance is ALREADY positive
  // return balance?.greaterThan(ZERO) ? (
  //   <Row style={style}>
  //     <ImageWithFallback src={logo} width={30} height={30} alt={`${asset.symbol}`} />
  //     <NameWrapper>
  //       <div>{asset.id}</div>
  //       <div>{asset.name}</div>
  //     </NameWrapper>
  //     {balance ? <div>{balance?.toSignificant(6)}</div> : <Loader size="12px" duration={'3s'} />}
  //   </Row>
  // ) : null
  return (
    <Row style={style}>
      <ImageWithFallback src={logo} width={30} height={30} alt={`${asset.symbol}`} />
      <NameWrapper>
        <div>{asset.symbol}</div>
        <div>{asset.name}</div>
      </NameWrapper>
      {balance ? <div>{balance?.toSignificant(6)}</div> : <Loader size="12px" duration={'3s'} />}
    </Row>
  )
}
