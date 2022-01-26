import React, { useState, useRef, useMemo } from 'react'
import styled from 'styled-components'
import Link from 'next/link'

import { NavButton } from 'components/Button'
import {
  ThemeToggle,
  NavToggle,
  IconWrapper,
  Trade as TradeIcon,
  Portfolio as PortfolioIcon,
  Markets as MarketsIcon,
  Twitter,
} from 'components/Icons'
import { Card } from 'components/Card'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { Z_INDEX } from 'theme'
import { useDarkModeManager } from 'state/user/hooks'
import { useRouter } from 'next/router'
import { ExternalLink } from 'components/Link'

const Container = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
`

const InlineModal = styled(Card)<{
  isOpen: boolean
}>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  width: 220px;
  transform: translateX(-220px) translateY(15px);
  z-index: ${Z_INDEX.modal};
  gap: 10px;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 10px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }
`

export default function Menu() {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, toggleDarkMode] = useDarkModeManager()

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  // Get custom theme name from url, if any
  // Allow the default light/dark theme toggle if there isn't any custom theme defined via url
  const router = useRouter()
  const showThemeToggle = !router.query?.theme

  const tradeLink = useMemo(() => {
    return router.pathname === '/trade' ? router.asPath : '/trade'
  }, [router])

  return (
    <Container ref={ref}>
      <NavButton onClick={() => toggle()}>
        <NavToggle />
      </NavButton>
      <div>
        <InlineModal isOpen={isOpen}>
          <Link href={tradeLink}>
            <Row>
              <div>Trade</div>
              <IconWrapper>
                <TradeIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href={'/portfolio'}>
            <Row>
              <div>Portfolio Manager</div>
              <IconWrapper>
                <PortfolioIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href={'/markets'}>
            <Row>
              <div>Explore Markets</div>
              <IconWrapper>
                <MarketsIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          {showThemeToggle && (
            <Row onClick={toggleDarkMode}>
              <div>{darkMode ? 'Light Theme' : 'Dark Theme'}</div>
              <ThemeToggle />
            </Row>
          )}
          <ExternalLink href="https://twitter.com">
            <Row>
              <div>Twitter</div>
              <IconWrapper>
                <Twitter size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )

  // return (
  //   <Wrapper ref={wrapperRef} toggled={toggled}>
  //     <Web3Status />
  //     <NavButton onClick={() => toggleDarkMode()}>
  //       <ThemeToggle size={20} />
  //     </NavButton>
  //     <Web3Network />
  //   </Wrapper>
  // )
}
