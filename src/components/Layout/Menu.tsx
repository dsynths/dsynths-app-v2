import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
import { Z_INDEX } from 'theme'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { useIsDedicatedTheme } from 'hooks/useTheme'
import { useDarkModeManager } from 'state/user/hooks'

import {
  ThemeToggle,
  NavToggle,
  IconWrapper,
  Info as InfoIcon,
  Markets as MarketsIcon,
  Telegram as TelegramIcon,
  Trade as TradeIcon,
  Twitter as TwitterIcon,
  Github as GithubIcon,
  Wallet as WalletIcon,
} from 'components/Icons'
import { Card } from 'components/Card'

import { NavButton } from 'components/Button'
import { ExternalLink } from 'components/Link'
import { ArrowRight } from 'react-feather'

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

const Row = styled.div<{
  active?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }

  ${({ active }) =>
    active &&
    `
    pointer-events: none;
  `};
`

export default function Menu() {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const isDedicatedTheme = useIsDedicatedTheme()
  const router = useRouter()

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  const buildUrl = useCallback(
    (path: string) => {
      return isDedicatedTheme ? `/${path}?theme=${router.query.theme}` : `/${path}`
    },
    [router, isDedicatedTheme]
  )

  return (
    <Container ref={ref}>
      <NavButton onClick={() => toggle()}>
        <NavToggle />
      </NavButton>
      <div>
        <InlineModal isOpen={isOpen}>
          <Link href={buildUrl('trade')} passHref>
            <Row onClick={() => toggle()} active={router.route === '/trade'}>
              <div>Trade</div>
              <IconWrapper>
                <TradeIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href={buildUrl('portfolio')} passHref>
            <Row active={router.route === '/portfolio'}>
              <div>Portfolio</div>
              <IconWrapper>
                <WalletIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href={buildUrl('markets')} passHref>
            <Row onClick={() => toggle()} active={router.route === '/markets'}>
              <div>Explore Markets</div>
              <IconWrapper>
                <MarketsIcon size={15} />
              </IconWrapper>
            </Row>
          </Link>
          {!isDedicatedTheme && (
            <Row onClick={() => toggleDarkMode()}>
              <div>{darkMode ? 'Light Theme' : 'Dark Theme'}</div>
              <ThemeToggle />
            </Row>
          )}
          <ExternalLink href="https://docs.deus.finance/synchronizer/overview">
            <Row onClick={() => toggle()}>
              <div>Docs</div>
              <IconWrapper>
                <InfoIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://twitter.com/dsynths">
            <Row onClick={() => toggle()}>
              <div>Twitter</div>
              <IconWrapper>
                <TwitterIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://t.me/dsynths">
            <Row onClick={() => toggle()}>
              <div>Community</div>
              <IconWrapper>
                <TelegramIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://github.com/dsynths">
            <Row onClick={() => toggle()}>
              <div>Github</div>
              <IconWrapper>
                <GithubIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://legacy.dsynths.com">
            <Row onClick={() => toggle()}>
              <div>Legacy App</div>
              <IconWrapper>
                <ArrowRight size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
