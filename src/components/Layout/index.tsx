import React from 'react'
import styled from 'styled-components'

import NavBar from './NavBar'

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  flex-flow: column nowrap;
`

// Scroll content so we can use a semi transparent navbar.
const Content = styled.div`
  display: block;
  position: relative;
  height: calc(100vh - 55px);
  overflow: scroll;
  padding-bottom: 20px;
  @media only screen and (min-width: 767px) {
    padding-bottom: 40px;
  }
`

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Wrapper>
      <NavBar />
      <Content>{children}</Content>
    </Wrapper>
  )
}
