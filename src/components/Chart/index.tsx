import React from 'react'
import styled, { useTheme } from 'styled-components'
import { ResponsiveContainer, YAxis, AreaChart, Area } from 'recharts'

const MarginWrapper = styled.div`
  width: calc(100% + 10px);
  height: 100%;
  transform: translate(-5px, 5px);
`

const Container = styled(ResponsiveContainer)<{
  noData: boolean
  loading: boolean
  placeholder: string
}>`
  ${({ noData, placeholder, theme }) =>
    noData &&
    `
    position: relative;
    &:after {
      content: '${placeholder}';
      display: flex;
      justify-content: center;
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: ${theme.text1};
      opacity: 0.4;
      pointer-events: none;
    }
  `}

  ${({ loading, theme }) =>
    loading &&
    `
    position: relative;
    &:after {
      content: 'Loading...';
      display: flex;
      justify-content: center;
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: ${theme.text1};
      opacity: 0.4;
      pointer-events: none;
    }
  `}
`

export function LineChart({
  data,
  loading,
  dataKey,
  placeholder = 'No Data Available',
}: {
  data: any[]
  loading: boolean
  dataKey: string
  placeholder?: string
}) {
  const theme = useTheme()

  return (
    <MarginWrapper>
      <Container noData={!data.length} loading={loading} placeholder={placeholder} width="100%" height="100%">
        <AreaChart data={data}>
          <YAxis dataKey={dataKey} type="number" domain={['dataMin', 'dataMax']} hide={true} />
          <Area
            dataKey={dataKey}
            type="monotone"
            stroke={theme.primary3}
            fill="rgba(255, 255, 255, 0.1)"
            strokeWidth={1}
          />
        </AreaChart>
      </Container>
    </MarginWrapper>
  )
}
