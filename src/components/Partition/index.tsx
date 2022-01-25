import styled from 'styled-components'

export const HorPartition = styled.div<{
  color?: string
}>`
  display: block;
  height: 0px;
  border-bottom: 1px solid ${({ theme, color }) => color ?? theme.border2};
`
