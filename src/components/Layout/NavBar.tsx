import React, { useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import Web3Network from 'components/Web3Network'
import Web3Status from 'components/Web3Status'
import { ThemeToggle, Search as SearchIcon } from 'components/Icons'
import { NavButton } from 'components/Button'
import AssetsModal from 'components/AssetsModal'
import Menu from './Menu'
import NavLogo from './NavLogo'

import { Z_INDEX } from 'theme'
import { useDarkModeManager } from 'state/user/hooks'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 0px 2rem;
  height: 55px;
  align-items: center;
  background: ${({ theme }) => theme.bg2};
  border-bottom: ${({ theme }) => theme.border2};
  gap: 5px;
  z-index: ${Z_INDEX.fixed};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px 1.25rem;
  `};
`

const NavItems = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 5px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    & > * {
      display: none;
    }
`};
`

const SearchText = styled.div`
  font-size: 0.8rem;
  margin-right: 5px;
  color: ${({ theme }) => theme.text2};
`

export default function NavBar() {
  const [, toggleDarkMode] = useDarkModeManager()
  const [assetModalOpen, setAssetModalOpen] = useState<boolean>(false)

  // get custom theme name from url, if any
  // allow the default light/dark theme toggle if there isn't any custom theme defined via url
  const router = useRouter()
  const showThemeToggle = !router.query?.theme

  return (
    <Wrapper>
      <NavLogo />
      <NavItems>
        <NavButton onClick={() => setAssetModalOpen(true)}>
          <SearchText>Search for a stock</SearchText>
          <SearchIcon size={20} />
        </NavButton>
        {showThemeToggle && (
          <NavButton onClick={() => toggleDarkMode()}>
            <ThemeToggle size={20} />
          </NavButton>
        )}
        <Web3Status />
        <Web3Network />
        <Menu />
      </NavItems>
      <AssetsModal isOpen={assetModalOpen} onDismiss={() => setAssetModalOpen(false)} />
    </Wrapper>
  )
}
