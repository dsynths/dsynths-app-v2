import styled from 'styled-components'

export { default as ArrowBubble } from './ArrowBubble'
export { default as CheckMark } from './CheckMark'
export { Close } from './Close'
export { ConfirmationAnimation } from './Confirmation'
export { default as DotFlashing } from './DotFlashing'
export { ChevronLeft, ChevronDown, ChevronUp } from './Chevron'
export { default as GreenCircle } from './GreenCircle'
export { default as Connected } from './Connected'
export { default as Copy } from './Copy'
export { default as Loader } from './Loader'
export { default as NavToggle } from './NavToggle'
export { Network } from './Network'
export { Settings } from './Settings'
export { default as ThemeToggle } from './ThemeToggle'
export { Twitter, Telegram, Github } from './Socials'
export { default as Wallet } from './Wallet'

// for wrapping react feather icons
export const IconWrapper = styled.div<{ stroke?: string; size?: string; marginRight?: string; marginLeft?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size ?? '20px'};
  height: ${({ size }) => size ?? '20px'};
  margin-right: ${({ marginRight }) => marginRight ?? 0};
  margin-left: ${({ marginLeft }) => marginLeft ?? 0};
  & > * {
    stroke: ${({ stroke }) => stroke ?? 'white'};
  }
`
