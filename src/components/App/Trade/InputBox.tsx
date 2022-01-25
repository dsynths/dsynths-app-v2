import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { darken } from 'polished'

import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useAssetByContract } from 'hooks/useAssetList'
import ImageWithFallback from 'components/ImageWithFallback'
import AssetsModal from 'components/AssetsModal'
import { ChevronDown } from 'components/Icons'

const BalanceLabel = styled.div`
  height: 1rem;
  font-size: 0.7rem;
  text-align: right;
  margin-right: 5px;
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
  }
`

const InputWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-radius: 10px;
  gap: 10px;
  height: 56px;
  padding-left: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border2};
`

const MaxButton = styled.div`
  text-align: center;
  font-size: 1rem;
  border-radius: 6px;

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.secondary1};
  }
`

const Partition = styled.div`
  width: 1px;
  height: 30px;
  background: ${({ theme }) => theme.border2};
`

const InputField = styled.input`
  height: 100%;
  flex: 1;
  text-align: right;
  padding: 0px 1.25rem;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text2};

  &:focus,
  &:hover {
    outline: none;
  }
`

const AssetSelect = styled.div<{
  select?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  padding: 5px;
  border-radius: 20px;
  background: ${({ select, theme }) => darken(0.05, select ? theme.secondary1 : theme.bg1)};
  color: ${({ theme }) => theme.text1};

  &:hover {
    cursor: pointer;
    background: ${({ select, theme }) => darken(0.07, select ? theme.secondary1 : theme.bg1)};
  }
`

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
const NumericalInput = ({
  value,
  onUserInput,
  placeholder,
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  placeholder: string
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  }

  return (
    <InputField
      {...rest}
      value={value}
      onChange={(event) => {
        // replace commas with periods
        enforcer(event.target.value.replace(/,/g, '.'))
      }}
      // universal input options
      inputMode="decimal"
      title="Amount"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={placeholder || '0.00'}
      min={0}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  )
}

export default function InputBox({
  currency,
  value,
  showSelect,
  showBalance,
  showMax,
  onChange,
}: {
  currency: Currency | undefined
  value: string
  showSelect?: boolean
  showBalance?: boolean
  showMax?: boolean
  onChange(x?: string): void
}) {
  const { account } = useWeb3React()
  const asset = useAssetByContract(currency?.wrapped.address)
  const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const logo = useCurrencyLogo(asset?.id, currency?.symbol)
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const handleClick = useCallback(() => {
    if (!balance || !onChange) return
    onChange(maxAmountSpend(balance)?.toExact())
  }, [balance, onChange])

  function getInput() {
    if (currency && showSelect) {
      return (
        <InputWrapper>
          <AssetSelect onClick={() => setModalOpen(true)}>
            <ImageWithFallback src={logo} width={30} height={30} alt={`${currency?.symbol} Logo`} round />
            <div>{currency?.symbol}</div>
            <ChevronDown size={15} />
          </AssetSelect>
          {showMax && (
            <>
              <Partition />
              <MaxButton onClick={handleClick}>MAX</MaxButton>
            </>
          )}
          <NumericalInput value={value || ''} onUserInput={onChange} placeholder={'Enter an amount'} autoFocus />
        </InputWrapper>
      )
    }
    if (currency && !showSelect) {
      return (
        <InputWrapper>
          <ImageWithFallback src={logo} width={30} height={30} alt={`${currency?.symbol} Logo`} round />
          <div>{currency?.symbol}</div>
          {showMax && (
            <>
              <Partition />
              <MaxButton onClick={handleClick}>MAX</MaxButton>
            </>
          )}
          <NumericalInput value={value || ''} onUserInput={onChange} placeholder={'Enter an amount'} autoFocus />
        </InputWrapper>
      )
    }
    return (
      <InputWrapper>
        <AssetSelect onClick={() => setModalOpen(true)}>
          <div>Select an asset</div>
          <ChevronDown size={15} />
        </AssetSelect>
      </InputWrapper>
    )
  }

  return (
    <>
      {showBalance && (
        <BalanceLabel onClick={handleClick}>
          {balance ? balance.toSignificant(6) : '0.00'} {currency?.symbol}
        </BalanceLabel>
      )}
      {getInput()}
      <AssetsModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} activeCurrency={currency} />
    </>
  )
}
