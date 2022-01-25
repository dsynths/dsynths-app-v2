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
import { useRouter } from 'next/router'

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

function colors(themeName: string): Colors {
  const supportedThemes = ['light', 'dark', 'spiritswap']
  // define colour scheme for each supported theme
  const themeColors = {
    light: {
      themeName,
      // base
      white,
      black,

      // text
      text1: '#000000',
      text2: '#78787B',
      text3: '#808086',
      text4: '#B8B8BE',

      // backgrounds / greys
      bg0: '#FFFFFF',
      bg1: '#F5F6FC',
      bg2: '#F0F0F7',
      bg3: '#E9E9F3',

      // borders
      border1: '#B8B8BE',
      border2: 'rgba(99, 126, 161, 0.2)',

      //specialty colors
      specialBG1:
        'radial-gradient(95.21% 95.21% at 50% 4.79%, rgba(138, 148, 220, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%)',
      specialBG2:
        'linear-gradient(90deg, rgba(81, 171, 255, 0.1) 0%, rgba(22, 72, 250, 0.1) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',

      // primary colors
      primary1: '#FFB463',
      primary2: '#FFA76A',
      primary3: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 167, 106, 0) 100%), #FFA76A',

      // color text
      primaryText1: '#FFB463', // TODO check if we want these values

      // secondary colors
      secondary1: '#1749FA',
      secondary2: 'rgba(23, 73, 250, 0.2)',

      // other
      red1: '#DA2D2B',
      red2: '#DF1F38',
      red3: '#D60000',
      green1: '#007D35',
      yellow1: '#E3A507',
      yellow2: '#FF8F00',
      yellow3: '#F3B71E',
      blue1: '#0068FC',
      blue2: '#0068FC',

      error: '#DF1F38',
      success: '#007D35',
      warning: '#FF8F00',
    },
    dark: {
      themeName,
      // base
      white,
      black,

      // text
      text1: '#FFFFFF',
      text2: '#C3C5CB',
      text3: '#8F96AC',
      text4: '#B2B9D2',

      // backgrounds / greys
      bg0: '#14181E',
      bg1: '#262B35',
      bg2: '#0F1217',
      bg3: '#262B35',

      // borders
      border1: '#B8B8BE',
      border2: 'rgba(99, 126, 161, 0.2)',

      //specialty colors
      specialBG1: '#0F1217',
      specialBG2: '#14181E',

      // primary colors
      primary1: '#FFB463',
      primary2: '#FFA76A',
      primary3: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 167, 106, 0) 100%), #FFA76A',

      // color text
      primaryText1: '#1749FA', // TODO check if we want these values

      // secondary colors
      secondary1: '#1749FA',
      secondary2: 'rgba(23, 73, 250, 0.2)',

      // other
      red1: '#FF4343',
      red2: '#F82D3A',
      red3: '#D60000',
      green1: '#27AE60',
      yellow1: '#E3A507',
      yellow2: '#FF8F00',
      yellow3: '#F3B71E',
      blue1: '#2172E5',
      blue2: '#5199FF',

      error: '#FD4040',
      success: '#27AE60',
      warning: '#FF8F00',
    },
    spiritswap: {
      themeName,
      // base
      white,
      black,

      // text
      text1: '#45BAE5',
      text2: '#D9F1F9',
      text3: '#C7EAF7',
      text4: '#B4E3F4',

      // backgrounds / greys
      bg0: '#0D252D',
      bg1: '#143744',
      bg2: '#1B4A5B',
      bg3: '#225D72',

      // borders
      border1: '#ECF8FC',
      border2: 'rgba(99, 126, 161, 0.2)',

      //specialty colors
      specialBG1: '#061216',
      specialBG2: '#061216',

      // primary colors
      primary1: '#71D887',
      primary2: '#5AAC6C',
      primary3: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 167, 106, 0) 100%), #5AAC6C',

      // color text
      primaryText1: '#1749FA', // TODO check if we want these values

      // secondary colors
      secondary1: '#1749FA',
      secondary2: 'rgba(23, 73, 250, 0.2)',

      // other
      red1: '#FF4343',
      red2: '#F82D3A',
      red3: '#D60000',
      green1: '#27AE60',
      yellow1: '#E3A507',
      yellow2: '#FF8F00',
      yellow3: '#F3B71E',
      blue1: '#2172E5',
      blue2: '#5199FF',

      error: '#FD4040',
      success: '#27AE60',
      warning: '#FF8F00',
    },
  }
  // default the theme to light mode
  return supportedThemes.includes(themeName) ? themeColors[themeName] : themeColors['light']
}

function shadows(themeName: string): Shadows {
  const supportedThemes = ['light', 'dark', 'spiritswap']
  // define shadow scheme for each supported theme
  const themeShadows = {
    light: {
      shadow1: '#2F80ED',
      boxShadow1: '0px 0px 4px rgba(0, 0, 0, 0.125)',
      boxShadow2: '0px 5px 5px rgba(0, 0, 0, 0.15)',
    },
    dark: {
      shadow1: '#000',
      boxShadow1: '0px 0px 4px rgba(0, 0, 0, 0.125)',
      boxShadow2: '0px 5px 5px rgba(0, 0, 0, 0.15)',
    },
    spiritswap: {
      shadow1: '#000',
      boxShadow1: '0px 0px 4px rgba(0, 0, 0, 0.125)',
      boxShadow2: '0px 5px 5px rgba(0, 0, 0, 0.15)',
    },
  }
  return themeName in supportedThemes ? themeShadows[themeName] : themeShadows['light']
}

function theme(themeName: string): DefaultTheme {
  return {
    ...colors(themeName),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    ...shadows(themeName),

    // media queries
    mediaWidth: mediaWidthTemplates,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // get theme name from url if any
  const router = useRouter()
  let themeName = router.query?.theme
  
  const darkMode = useIsDarkMode()
  // if url doesn't have theme name, then use standard light/dark themes
  if (!themeName) themeName = darkMode ? 'dark' : 'light'
  const themeObject = useMemo(() => theme(themeName), [themeName])

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
