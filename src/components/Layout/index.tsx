import React from 'react'
import styled from 'styled-components'

import NavBar from './NavBar'
import Warning, { DISPLAY_WARNING } from './Warning'

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  flex-flow: column nowrap;
`

const Content = styled.div<{
  warning: boolean
}>`
  display: block;
  position: relative;
  height: calc(100vh - 55px - ${({ warning }) => (warning ? '80px' : '0px')});
  overflow: scroll;
`

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Wrapper>
      <NavBar />
      <Warning />
      <Content warning={DISPLAY_WARNING}>{children}</Content>
    </Wrapper>
  )
}
