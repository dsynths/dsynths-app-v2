import React from 'react'
import styled from 'styled-components'

import { AssetCard } from 'components/App/AssetCard'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 500px;
  margin: 0 auto;
  margin-top: 75px;
  gap: 10px;
  overflow: visible;
`

export default function Asset() {
  return (
    <Container>
      <AssetCard />
    </Container>
  )
}
