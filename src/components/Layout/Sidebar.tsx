import React, { useRef } from 'react'
import styled from 'styled-components'

import Web3Network from 'components/Web3Network'
import Web3Status from 'components/Web3Status'
import { NavButton } from 'components/Button'
import { ThemeToggle, Close as CloseIcon } from 'components/Icons'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { Z_INDEX } from 'theme'
import { useDarkModeManager } from 'state/user/hooks'

// TODO: design and create navbar

const Wrapper = styled.nav<{
  toggled: boolean
}>`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: clamp(200px, 70vw, 300px);
  position: absolute;
  background-color: ${({ theme }) => theme.bg1};
  padding: 1.5rem;
  gap: 10px;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  opacity: 0;
  z-index: ${Z_INDEX.modal};
  filter: drop-shadow(-2px 0px 10px ${({ theme }) => theme.border2});
  transition: all 0.3s;
  -webkit-transition: all 0.3s;
  pointer-events: none;
  ${({ toggled }) =>
    toggled &&
    `
    opacity: 1;
    pointer-events: auto;
  `};
`

const Header = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-bottom: auto;

  & > * {
    &:first-child {
      flex: 1;
    }
  }
`

const Close = styled(CloseIcon)`
  min-width: 18px;
  color: ${({ theme }) => theme.text2};
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
  &:hover {
    cursor: pointer;
    transform: rotate(90deg);
  }
`

export const Sidebar = ({ toggled, onToggle }: { toggled: boolean; onToggle: (val: boolean) => void }) => {
  const [, toggleDarkMode] = useDarkModeManager()
  const wrapperRef = useRef(null)
  useOnOutsideClick(wrapperRef, () => {
    onToggle(false)
  })

  return (
    <Wrapper ref={wrapperRef} toggled={toggled}>
      <Header>
        <Web3Status />
        <Close size={'1.4rem'} onClick={() => onToggle(false)} />
      </Header>
      <NavButton onClick={() => toggleDarkMode()}>
        <ThemeToggle size={20} />
      </NavButton>
      <Web3Network />
    </Wrapper>
  )
}
