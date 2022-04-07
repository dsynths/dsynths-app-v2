import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import DeusLogo from '/public/static/images/tokens/deus.svg'
import { ExternalLink } from 'components/Link'
import { Trade as TradeComponent, LineChart, Claim } from 'components/App/Trade'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
  overflow: visible;
  margin: 75px auto;
  width: clamp(250px, 90%, 512px);

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 30px;
  `}
`

const DeusBanner = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  gap: 5px;
  margin-top: 24px;
  opacity: 0.5;
`

export default function Trade() {
  return (
    <Container>
      <LineChart />
      <TradeComponent />
      <Claim />
      <DeusBanner>
        <Image src={DeusLogo} alt="DEUS Logo" width="15px" height="15px" />
        <ExternalLink href="https://deus.finance">Powered by DEUS Finance</ExternalLink>
      </DeusBanner>
    </Container>
  )
}
