import React, { useMemo } from 'react'
import { Text, TextProps as TextPropsOriginal } from 'rebass'
import styled, {
  createGlobalStyle,
  css,
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components'

import { useIsDarkMode } from 'state/user/hooks'
import { Colors } from './styled'

type TextProps = Omit<TextPropsOriginal, 'css'>

export const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
}

export enum Z_INDEX {
  deprecated_zero = 0,
  deprecated_content = 1,
  dropdown = 1000,
  sticky = 1020,
  fixed = 1030,
  modalBackdrop = 1040,
  offcanvas = 1050,
  modal = 1060,
  popover = 1070,
  tooltip = 1080,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

function colors(darkMode: boolean): Colors {
  return {
    darkMode,
    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#000000',
    text2: darkMode ? '#C3C5CB' : '#78787B',
    text3: darkMode ? '#8F96AC' : '#808086',
    text4: darkMode ? '#B2B9D2' : '#B8B8BE',

    // backgrounds / greys
    bg0: darkMode ? '#14181E' : '#FFFFFF',
    bg1: darkMode ? '#262B35' : '#F5F6FC',
    bg2: darkMode ? '#0F1217' : '#F0F0F7',
    bg3: darkMode ? '#262B35' : '#E9E9F3',

    // borders
    border1: '#B8B8BE',
    border2: 'rgba(99, 126, 161, 0.2)',

    //specialty colors
    specialBG1: darkMode
      ? '#0F1217'
      : 'radial-gradient(95.21% 95.21% at 50% 4.79%, rgba(138, 148, 220, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%)',
    specialBG2: darkMode
      ? '#14181E'
      : 'linear-gradient(90deg, rgba(81, 171, 255, 0.1) 0%, rgba(22, 72, 250, 0.1) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',

    // primary colors
    primary1: '#FFB463',
    primary2: '#FFA76A',
    primary3: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 167, 106, 0) 100%), #FFA76A',

    // color text
    primaryText1: darkMode ? '#1749FA' : '#FFB463', // TODO check if we want these values

    // secondary colors
    secondary1: '#1749FA',
    secondary2: 'rgba(23, 73, 250, 0.2)',

    // other
    red1: darkMode ? '#FF4343' : '#DA2D2B',
    red2: darkMode ? '#F82D3A' : '#DF1F38',
    red3: '#D60000',
    green1: darkMode ? '#27AE60' : '#007D35',
    yellow1: '#E3A507',
    yellow2: '#FF8F00',
    yellow3: '#F3B71E',
    blue1: darkMode ? '#2172E5' : '#0068FC',
    blue2: darkMode ? '#5199FF' : '#0068FC',

    error: darkMode ? '#FD4040' : '#DF1F38',
    success: darkMode ? '#27AE60' : '#007D35',
    warning: '#FF8F00',
  }
}

function theme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',
    boxShadow1: '0px 0px 4px rgba(0, 0, 0, 0.125)',
    boxShadow2: '0px 5px 5px rgba(0, 0, 0, 0.15)',

    // media queries
    mediaWidth: mediaWidthTemplates,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

/**
 * Preset styles of the Rebass Text component
 */
export const ThemedText = {
  Main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />
  },
  Link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  Label(props: TextProps) {
    return <TextWrapper fontWeight={600} color={'text1'} {...props} />
  },
  Black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  White(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  Body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  LargeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  MediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  SubHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  Small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  Blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  Yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow3'} {...props} />
  },
  DarkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  Gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  Italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  Error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  },
}

export const ThemedGlobalStyle = createGlobalStyle`
  html {
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg0} !important;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
  }
  a {
    color: ${({ theme }) => theme.text1}; 
  }

  * {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Rubik';
    background: ${({ theme }) => theme.specialBG1}
  }

  button {
    all: unset;
    cursor: pointer;
    padding: 0px;
  }

  *, *:before, *:after {
    -webkit-box-sizing: inherit;
    -moz-box-sizing: inherit;
    box-sizing: inherit;
  }

  * {
    -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none; /* for Firefox */
    overflow-y: scroll;
  }
  *::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
  }
`
