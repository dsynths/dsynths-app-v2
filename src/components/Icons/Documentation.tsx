import styled from 'styled-components'
import { Info } from 'react-feather'

export const Documentation = styled(Info)<{
  size?: string
  [x: string]: any
}>`
  width: ${(props) => props.size ?? '15px'};
  height: ${(props) => props.size ?? '15px'};
  fill: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`
