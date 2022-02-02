import styled from 'styled-components'

export const Card = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: hidden;
  background: ${({ theme }) => theme.bg0};
  box-shadow: ${({ theme }) => theme.boxShadow1};
  border-radius: 10px;
  padding: 1.25rem;
`
