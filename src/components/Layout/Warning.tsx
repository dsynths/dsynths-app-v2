import { Card } from 'components/Card'
import React from 'react'
import styled, { useTheme } from 'styled-components'
import { AlertTriangle } from 'react-feather'

import { ExternalLink } from 'components/Link'
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
  border: 1px solid ${({ theme }) => theme.red1};
  font-size: 1rem;
  z-index: ${Z_INDEX.fixed};

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
      <AlertTriangle color={theme.red1} size="80px" />
      <div>
        Trading on dSynths is temorarily suspended until further notice. Visit our{' '}
        <ExternalLink href="https://t.me/dsynths">Telegram</ExternalLink> for more information. Apologies for the
        inconvenience!
      </div>
    </Wrapper>
  ) : null
}
