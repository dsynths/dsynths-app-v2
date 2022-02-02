import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import BigNumber from 'bignumber.js'

import { LineChart as Chart } from 'components/Chart'
import { Card } from 'components/Card'
import { formatDollarAmount } from 'utils/numbers'

const Wrapper = styled(Card)<{
  border?: boolean
}>`
  padding: 0;
  border: ${({ theme, border }) => (border ? `1px solid ${theme.border2}` : 'none')};

  & > * {
    &:last-child {
      height: 150px;
      ${({ theme }) => theme.mediaWidth.upToMedium`
        height: 100px;
      `}
    }
  }
`

const InfoWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 6px;
  margin: 20px;
  align-items: center;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.text1};
`

const data = [
  { name: 1, value: 1 },
  { name: 1, value: 1.2 },
  { name: 1, value: 1.3 },
  { name: 1, value: 1.4 },
  { name: 1, value: 1.25 },
  { name: 1, value: 1.5 },
  { name: 1, value: 1.8 },
  { name: 1, value: 2 },
  { name: 1, value: 2.4 },
  { name: 1, value: 2.9 },
  { name: 1, value: 4 },
  { name: 1, value: 4.5 },
  { name: 1, value: 6 },
  { name: 1, value: 4 },
  { name: 1, value: 5 },
  { name: 1, value: 3 },
  { name: 1, value: 2 },
  { name: 1, value: 1.5 },
  { name: 1, value: 1.5 },
  { name: 1, value: 1.6 },
  { name: 1, value: 1.65 },
  { name: 1, value: 1.8 },
  { name: 1, value: 2 },
  { name: 1, value: 2.4 },
  { name: 1, value: 1.8 },
  { name: 1, value: 2.3 },
  { name: 1, value: 1.9 },
  { name: 1, value: 2 },
  { name: 1, value: 2.4 },
  { name: 1, value: 2.9 },
  { name: 1, value: 4 },
  { name: 1, value: 6 },
]

export default function EquityChart({ showEquity, totalEquity }: { showEquity: boolean; totalEquity: BigNumber }) {
  const router = useRouter()
  const isSpiritTheme = useMemo(() => {
    return router.query?.theme === 'spirit'
  }, [router])

  return (
    <Wrapper border={isSpiritTheme}>
      <InfoWrapper>
        <div>Overview</div>
        {showEquity && <div>{formatDollarAmount(totalEquity.toNumber())}</div>}
      </InfoWrapper>
      <Chart data={data} dataKey="value" loading={false} content={'PNL chart coming soon!'} />
    </Wrapper>
  )
}
