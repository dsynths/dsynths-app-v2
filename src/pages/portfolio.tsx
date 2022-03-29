import React from 'react'
import styled from 'styled-components'
import { EquityChart, Portfolio as PortfolioList, Transactions } from 'components/App/Portfolio'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: clamp(250px, 90%, 512px);
  margin: 75px auto;
  gap: 5px;
  overflow: visible;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 30px;
  `}
`

export default function Portfolio() {
  return (
    <Container>
      <EquityChart />
      <PortfolioList />
      <Transactions />
    </Container>
  )
}
