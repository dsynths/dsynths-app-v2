import { useMemo } from 'react'

// TODO make this more intelligent
export default function useCurrencyLogo(id: string | undefined, symbol: string | undefined): StaticImageData {
  return useMemo(() => {
    try {
      return id
        ? require(`assets/img/tickers/${id.toUpperCase()}.png`)
        : symbol === 'DEI'
        ? require('assets/img/tokens/dei.svg')
        : require('assets/img/fallback/ticker.png')
    } catch (err) {
      return require('assets/img/fallback/ticker.png')
    }
  }, [id, symbol])
}
