import React, { useMemo } from 'react'
import styled from 'styled-components'

import { useIsJadeTheme } from 'hooks/useTheme'
import { useShowEquity, useTotalEquity } from 'state/portfolio/hooks'
import { formatDollarAmount } from 'utils/numbers'
import { LineChart as Chart } from 'components/Chart'
import { Card } from 'components/Card'
import useWeb3React from 'hooks/useWeb3'
import { SynchronizerChains } from 'constants/chains'

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

export default function EquityChart() {
  const { chainId, account } = useWeb3React()
  const isJadeTheme = useIsJadeTheme()
  const showEquity = useShowEquity()
  const totalEquity = useTotalEquity()

  const isSupportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return SynchronizerChains.includes(chainId)
  }, [chainId, account])

  return (
    <Wrapper border={isJadeTheme}>
      <InfoWrapper>
        <div>Overview</div>
        {showEquity && isSupportedChainId && <div>{formatDollarAmount(Number(totalEquity))}</div>}
      </InfoWrapper>
      <Chart data={data} dataKey="value" loading={false} content={'PNL chart coming soon!'} />
    </Wrapper>
  )
}
