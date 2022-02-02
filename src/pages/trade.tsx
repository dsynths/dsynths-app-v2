import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { Trade as TradeComponent, LineChart } from 'components/App/Trade'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
  overflow: visible;
  margin: 0 auto;
  margin-top: 75px;
  width: clamp(250px, 90%, 512px);

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 30px;
  `}
`

export default function Trade() {
  return (
    <Container>
      {!isMobile && <LineChart />}
      <TradeComponent />
    </Container>
  )
}
