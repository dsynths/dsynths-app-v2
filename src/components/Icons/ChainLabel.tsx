import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import React from 'react'
import styled from 'styled-components'

const ChainLabelWrapper = styled.div<{
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

export default function ChainLabel({ chainId }: { chainId: SupportedChainId }) {
  const chainLabel = ChainInfo[chainId].label
  switch (chainId) {
    case SupportedChainId.MAINNET:
      return <ChainLabelWrapper bgColour="#0779E4">{chainLabel}</ChainLabelWrapper>
    case SupportedChainId.RINKEBY:
      return <ChainLabelWrapper bgColour="#0779E4">{chainLabel}</ChainLabelWrapper>
    case SupportedChainId.BSC:
      return <ChainLabelWrapper bgColour="#F6CC2E">{chainLabel}</ChainLabelWrapper>
    case SupportedChainId.FANTOM:
      return <ChainLabelWrapper bgColour="#0094FF">{chainLabel}</ChainLabelWrapper>
    case SupportedChainId.POLYGON:
      return <ChainLabelWrapper bgColour="#7533e2">{chainLabel}</ChainLabelWrapper>
    default:
      return null
  }
}
