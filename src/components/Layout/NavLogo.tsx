import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Image from 'next/image'

import NAV_LOGO from 'assets/img/dSynthsLogo.svg'
import NAV_TEXT_WHITE from 'assets/img/dSynthsWhiteText.svg'
import NAV_TEXT_BLACK from 'assets/img/dSynthsBlackText.svg'
import { useIsDarkMode } from 'state/user/hooks'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-right: auto;

  &:hover {
    cursor: pointer;
  }

  & > div {
    display: flex;
    align-items: center;
    &:first-child {
      margin-right: 13px;
    }
  }
`

export default function NavLogo() {
  const darkMode = useIsDarkMode()
  return (
    <Link href="/" passHref>
      <Wrapper>
        <div>
          <Image src={NAV_LOGO} alt="App Logo" width={30} height={30} />
        </div>
        <div>
          <Image src={darkMode ? NAV_TEXT_WHITE : NAV_TEXT_BLACK} alt="App Logo" height={22} />
        </div>
      </Wrapper>
    </Link>
  )
}
