import React from 'react'
import styled from 'styled-components'

import { Trade as TradeComponent } from 'components/App/Trade'

const Container = styled.div`
  margin-top: 75px;
  display: flex;
  flex-flow: row nowrap;
  overflow: visible;
  & > * {
    display: flex;
    justify-content: center;

    &:first-child {
      flex: 1;
      margin-right: auto;
    }
    &:nth-child(2) {
      width: clamp(250px, 80%, 512px);
    }
    &:last-child {
      flex: 1;
      margin-left: auto;
    }
  }
`

export default function Trade() {
  return (
    <Container>
      <div />
      <TradeComponent />
      <div />
    </Container>
  )
}
