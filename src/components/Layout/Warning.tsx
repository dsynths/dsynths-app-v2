import { Card } from 'components/Card'
import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Info } from 'react-feather'

import { Z_INDEX } from 'theme'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: row nowrap;
  width: clamp(150px, 90%, 700px);
  height: 80px;
  gap: 15px;
  align-self: center;
  align-items: center;
  margin: 10px 0;
  border: 1px solid ${({ theme }) => theme.yellow1};
  font-size: 1rem;
  z-index: ${Z_INDEX.fixed};
  padding: 0.25rem 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.7rem;
  `}
`

// toggle this flag and modify the contents to show a banner whenever desired
export const DISPLAY_WARNING = true

export default function Warning() {
  const theme = useTheme()
  return DISPLAY_WARNING ? (
    <Wrapper>
      <Info color={theme.yellow1} size="80px" />
      <div>
        All previous positions on dSynths were closed and the respective amounts were airdropped to wallets in DEI.
        <br />
        You can trade RUB, EUR until v3 is launched. Happy trading!
      </div>
    </Wrapper>
  ) : null
}
