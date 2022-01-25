import React from 'react'
import { useIsDarkMode } from 'state/user/hooks'
import { useTheme } from 'styled-components'

export default function ArrowBubble({ size = 12, ...rest }: { size?: number; [x: string]: any }) {
  const isDarkMode = useIsDarkMode()
  const theme = useTheme()

  const circleFill = isDarkMode ? 'black' : theme.bg1
  const circleStroke = isDarkMode ? 'none' : theme.text2
  const arrow = isDarkMode ? 'white' : theme.text1

  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" {...rest}>
      <circle cx="15" cy="15" r="14.5" transform="rotate(90 15 15)" fill={circleFill} stroke={circleStroke} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={arrow}
        d="M16.3808 10.1989L20.7018 14.5199C20.967 14.785 20.967 15.215 20.7018 15.4801L16.3808 19.8011C16.1156 20.0663 15.6857 20.0663 15.4206 19.8011C15.1554 19.536 15.1554 19.1061 15.4206 18.8409L18.5825 15.679L8.67898 15.679C8.30399 15.679 8 15.375 8 15C8 14.625 8.30399 14.321 8.67898 14.321L18.5825 14.321L15.4206 11.1591C15.1554 10.8939 15.1554 10.464 15.4206 10.1989C15.6857 9.93371 16.1156 9.93371 16.3808 10.1989Z"
      />
    </svg>
  )
}
