import React, { useMemo } from 'react'
import styled, { useTheme } from 'styled-components'
import { AlertTriangle } from 'react-feather'
import { Currency } from '@sushiswap/core-sdk'
import Countdown from 'react-countdown'

import useWeb3React from 'hooks/useWeb3'
import useAddTokenToMetaMask from 'hooks/useAddTokenToMetaMask'

import { ExplorerDataType } from 'utils/explorers'

import { Modal, ModalHeader } from 'components/Modal'
import { ConfirmationAnimation, CheckMark } from 'components/Icons'
import { PrimaryButton } from 'components/Button'
import { ExplorerLink } from 'components/Link'
import { useBlockNumber } from 'state/application/hooks'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
`

const PendingWrapper = styled(Wrapper)`
  align-items: center;
  text-align: center;
  & > * {
    margin-bottom: 1rem;
    &:last-child {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.text2};
      margin-top: 1rem;
    }
  }
`

const ErrorWrapper = styled(Wrapper)`
  gap: 1.25rem;
  align-items: center;
  text-align: center;
  margin: 1.25rem;
  font-size: 0.9rem;

  & > * {
    &:nth-child(2) {
      color: ${({ theme }) => theme.red1};
    }
  }
`

const SuccessWrapper = styled(Wrapper)`
  gap: 1.25rem;
  align-items: center;
  text-align: center;
  margin: 1.25rem;
  font-size: 1.2rem;

  & > * {
    &:nth-child(2) {
      font-weight: bold;
    }
    &:nth-child(3) {
      color: ${({ theme }) => theme.blue1};
      font-size: 1rem;
    }
  }
`

// The tx confirmation modal, relies on ConfirmationContent embedded as `content`
export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  expiryBlock,
  summary,
  currencyToAdd,
  content,
}: {
  isOpen: boolean
  onDismiss: () => void
  attemptingTxn: boolean
  hash?: string
  expiryBlock: number | undefined
  summary: string
  currencyToAdd?: Currency
  content: React.ReactNode
}) {
  const { chainId } = useWeb3React()
  if (!chainId) return null

  return (
    <Modal isOpen={isOpen} onBackgroundClick={onDismiss} onEscapeKeydown={onDismiss}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} summary={summary} expiryBlock={expiryBlock} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content
      )}
    </Modal>
  )
}

/**
 * Content to display in the TransactionConfirmationModal
 * @param title title for the ModalHeader
 * @param mainContent Any of the components within the TransactionConfirmationModal directory
 * @param bottomContent Callback button of some sort
 */
export function ConfirmationContent({
  title,
  onDismiss,
  mainContent,
  bottomContent,
}: {
  title: string
  onDismiss: () => void
  mainContent?: (() => React.ReactNode) | React.ReactNode
  bottomContent?: (() => React.ReactNode) | React.ReactNode
}) {
  return (
    <Wrapper>
      <ModalHeader title={title} onClose={onDismiss} />
      {typeof mainContent === 'function' ? mainContent() : mainContent}
      {typeof bottomContent === 'function' ? bottomContent() : bottomContent}
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useTheme()
  return (
    <div>
      <ModalHeader title="Error" onClose={onDismiss} border={false} />
      <ErrorWrapper>
        <AlertTriangle size="80px" color={theme.red1} />
        <div>{message}</div>
        <PrimaryButton onClick={onDismiss}>Dismiss</PrimaryButton>
      </ErrorWrapper>
    </div>
  )
}

const FTM_BLOCK_TIME = 0.9

// User needs to confirm the transaction in their wallet
function ConfirmationPendingContent({
  onDismiss,
  summary,
  expiryBlock,
}: {
  onDismiss: () => void
  summary: string
  expiryBlock: number | undefined
}) {
  const currentBlockNumber = useBlockNumber()
  const expiryTime = useMemo(() => {
    return Math.floor(Number(expiryBlock) - Number(currentBlockNumber) * FTM_BLOCK_TIME)
  }, [expiryBlock, currentBlockNumber])

  // Renderer callback with condition
  const renderer = ({ seconds, completed }: { seconds: number; completed: any }) => {
    if (!completed) {
      return <div>Oracle signatures have expired. Please reject the transaction.</div>
    } else {
      return (
        <div>
          Please confirm the transaction within <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{seconds}</span>s
        </div>
      )
    }
  }

  return (
    <div>
      <ModalHeader title=" " onClose={onDismiss} border={false} />
      <PendingWrapper>
        <ConfirmationAnimation size="80px" />
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Waiting for Confirmation</div>
        <div>{summary}</div>
        <Countdown date={Date.now() + expiryTime} renderer={renderer} precision={3} />
      </PendingWrapper>
    </div>
  )
}

// Transaction is submitted by the user
function TransactionSubmittedContent({
  chainId,
  hash,
  onDismiss,
  currencyToAdd,
}: {
  chainId: number
  hash: string
  onDismiss: () => void
  currencyToAdd?: Currency | undefined
}) {
  const { library } = useWeb3React()
  const { addToken, success } = useAddTokenToMetaMask(currencyToAdd)

  return (
    <div>
      <ModalHeader title=" " onClose={onDismiss} border={false} />
      <SuccessWrapper>
        <CheckMark size={80} />
        <div>Transaction Submitted</div>
        <ExplorerLink chainId={chainId} type={ExplorerDataType.TRANSACTION} value={hash}>
          View on Explorer
        </ExplorerLink>
        {currencyToAdd && library?.provider?.isMetaMask && (
          <PrimaryButton onClick={!success ? addToken : onDismiss}>
            Add {currencyToAdd.symbol} to Metamask
          </PrimaryButton>
        )}
      </SuccessWrapper>
    </div>
  )
}
