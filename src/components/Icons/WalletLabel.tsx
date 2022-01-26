import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import React from 'react'
import styled, { useTheme } from 'styled-components'

const WalletLabelWrapper = styled.div<{
  bgColour: string
}>`
  background: ${(props) => props.bgColour};
  border: 0.5px solid #d2d2d2;
  box-sizing: border-box;
  border-radius: 5px;
  font-size: 10.5px;
  line-height: 13px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 0.005em;
  color: #ffffff;
  padding: 0px 5px;
`

export default function WalletLabel({
  size = 12,
  chainId = 1,
  ...rest
}: {
  size?: number
  chainId?: number
  [x: string]: any
}) {
  switch (chainId) {
    case SupportedChainId.MAINNET:
      return <WalletLabelWrapper bgColour="#0779E4">{ChainInfo[chainId].nativeCurrency.name}</WalletLabelWrapper>
    case SupportedChainId.RINKEBY:
      return <WalletLabelWrapper bgColour="#0779E4">{ChainInfo[chainId].nativeCurrency.name}</WalletLabelWrapper>
    case SupportedChainId.BSC:
      return <WalletLabelWrapper bgColour="#F6CC2E">{ChainInfo[chainId].nativeCurrency.name}</WalletLabelWrapper>
    case SupportedChainId.FANTOM:
      return <WalletLabelWrapper bgColour="#0094FF">{ChainInfo[chainId].nativeCurrency.name}</WalletLabelWrapper>
    case SupportedChainId.POLYGON:
      return <WalletLabelWrapper bgColour="#7533e2">{ChainInfo[chainId].nativeCurrency.name}</WalletLabelWrapper>
    default:
      return null
  }
}
