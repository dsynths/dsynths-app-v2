import { Card } from 'components/Card'
import React from 'react'
import styled, { useTheme } from 'styled-components'
import { AlertTriangle } from 'react-feather'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: row;
  width: fit-content;
  align-self: center;
  padding: 1rem 3.5rem;
  margin-bottom: -3rem;
  border: 1px solid ${({ theme }) => theme.red1};
`

const IconWrapper = styled.div`
  margin-top: 2px;
  margin-right: 0.5rem;
`

// toggle this flag and modify the contents to show respective header info in times of downtimes
const DISPLAY_HEADER = true

export default function Header() {
  const theme = useTheme()
  return DISPLAY_HEADER ? (
    <Wrapper>
      <IconWrapper>
        <AlertTriangle color={theme.red1} size={'1rem'} />
      </IconWrapper>
      <div>Trading on dSynths is paused until further notice.</div>
    </Wrapper>
  ) : null
}
