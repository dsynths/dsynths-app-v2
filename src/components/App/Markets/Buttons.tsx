import styled from 'styled-components'

export const NetworkButton = styled.div<{
  active: boolean
}>`
  display: flex;
  text-align: center;
  align-text: center;
  font-size: 1rem;
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text3)};
  font-weight: ${({ active }) => (active ? 600 : 300)};

  &:hover {
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 0.9rem;
  `}
`

export const TradeButton = styled.button``
