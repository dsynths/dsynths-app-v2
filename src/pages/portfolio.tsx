import React from 'react'
import styled from 'styled-components'

import { Portfolio } from 'components/App/Portfolio'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 500px;
  margin: 0 auto;
  margin-top: 75px;
  gap: 10px;
  overflow: visible;
`

export default function Trade() {
  return (
    <Container>
      <div>
        This is where the PNL widget should go, but that is NOT priority!!! We can do that later, first perfect the
        actual barebones balance list.
      </div>
      <Portfolio />
    </Container>
  )
}
