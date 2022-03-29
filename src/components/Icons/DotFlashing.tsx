import React from 'react'
import styled, { keyframes } from 'styled-components'

const hexToRGB = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  if (alpha) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
  } else {
    return 'rgb(' + r + ',' + g + ',' + b + ')'
  }
}

const FlashingAnimation = (colour: string) => keyframes`
  0% {
    background: #000000;
    background: ${colour};
  }
  50% {
    background: rgba(0, 0, 0, 0.5);
    background: ${hexToRGB(colour, 0.5)};
  }
  100% {
    background: rgba(0, 0, 0, 0.25);
    background: ${hexToRGB(colour, 0.25)};
  }
`

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Dot = styled.div<{
  size: string
  gap: string
  colour: string
  delay: string
}>`
  background-color: black;
  border-radius: 50%;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  margin: 0 ${(props) => props.gap};
  animation: ${(props) => FlashingAnimation(props.colour)} 1s infinite linear alternate;
  animation-delay: ${(props) => props.delay};
`

export default function DotFlashing({
  size = '5px',
  gap = '1.5px',
  colour = '#000000',
  ...rest
}: {
  size?: string
  gap?: string
  colour?: string
  [x: string]: any
}) {
  return (
    <Wrapper {...rest}>
      <Dot delay="0s" colour={colour} size={size} gap={gap} />
      <Dot delay="0.35s" colour={colour} size={size} gap={gap} />
      <Dot delay="0.7s" colour={colour} size={size} gap={gap} />
    </Wrapper>
  )
}
