import React from 'react'
import styled from 'styled-components'

import { Trade as TradeComponent } from 'components/App/Trade'

const Container = styled.div`
  margin-top: 75px;
  display: flex;
  flex-flow: row nowrap;
  overflow: visible;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 30px;
  `}

  & > * {
    &:first-child {
      margin: 0 auto;
      width: clamp(250px, 90%, 512px);
    }
  }
`

export default function Trade() {
  return (
    <Container>
      <TradeComponent />
    </Container>
  )
}
