import styled from 'styled-components'
import { Button as RebassButton, ButtonProps as ButtonPropsOriginal } from 'rebass/styled-components'

type ButtonProps = Omit<ButtonPropsOriginal, 'css'>

export const BaseButton = styled(RebassButton)<
  {
    padding?: string
    width?: string
    $borderRadius?: string
    active?: boolean
    disabled?: boolean
  } & ButtonProps
>`
  padding: ${({ padding }) => padding ?? '1rem'};
  width: ${({ width }) => width ?? '100%'};
  font-weight: 500;
  text-align: center;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '20px'};
  outline: none;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }
  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);
  > * {
    user-select: none;
  }
  > a {
    text-decoration: none;
  }
`

export const NavButton = styled.button`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  height: 35px;
  font-size: 15px;
  align-items: center;
  text-align: center;
  padding: 0 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border2};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  &:hover,
  &:focus {
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.border1};
  }
`

export const PrimaryButton = styled(BaseButton)`
  background: ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.text1};
  z-index: 0;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary2};
    background: ${({ theme }) => theme.primary2};
  }
  &:hover {
    background: ${({ theme }) => theme.primary2};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary2};
    background: ${({ theme }) => theme.primary2};
  }
  &:disabled {
    background: ${({ theme, disabled }) => (disabled ? theme.primary1 : theme.bg2)};
    color: ${({ theme, disabled }) => (disabled ? theme.white : theme.text2)};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`
