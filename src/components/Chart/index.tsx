import React, { useEffect, useRef } from 'react'
import styled, { useTheme } from 'styled-components'
import { ResponsiveContainer, YAxis, AreaChart, Area, Tooltip } from 'recharts'
import useHover from 'hooks/useHover'

const MarginWrapper = styled.div`
  width: calc(100% + 10px);
  height: 100%;
  transform: translate(-5px, 5px);
`

const Container = styled(ResponsiveContainer)<{
  loading: boolean
  content: string
}>`
  ${({ content, theme }) =>
    content &&
    `
    position: relative;
    &:after {
      content: '${content}';
      display: flex;
      justify-content: center;
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: ${theme.text1};
      opacity: 0.2;
      pointer-events: none;
    }
  `}
`

export function LineChart({
  data,
  dataKey,
  loading,
  content = '',
  onTooltipHover,
}: {
  data: any[]
  dataKey: string
  loading: boolean
  content?: string
  onTooltipHover?: (value: number, shouldReset: boolean) => void
}) {
  const theme = useTheme()
  const hoverRef = useRef(null)
  const isHover = useHover(hoverRef)

  const onHover = (value: number) => {
    if (onTooltipHover) {
      onTooltipHover(value, false)
    }
  }

  useEffect(() => {
    if (onTooltipHover && !isHover) {
      onTooltipHover(0, true)
    }
  }, [onTooltipHover, isHover])

  return (
    <MarginWrapper ref={hoverRef}>
      <Container
        loading={loading}
        content={!data.length ? 'Chart is not available' : loading ? 'Loading...' : content}
        width="100%"
        height="100%"
      >
        <AreaChart data={data}>
          <YAxis dataKey={dataKey} type="number" domain={['dataMin', 'dataMax']} hide={true} />
          {onTooltipHover && (
            <Tooltip
              cursor={{ stroke: theme.primary1, opacity: 0.1 }}
              formatter={onHover}
              contentStyle={{
                display: 'none',
              }}
            />
          )}
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
