import { useMemo } from 'react'

// TODO make this more intelligent
export default function useCurrencyLogo(id: string | undefined, symbol: string | undefined): StaticImageData {
  return useMemo(() => {
    try {
      return id
        ? require(`/public/static/images/tickers/${id.toUpperCase()}.png`)
        : symbol === 'DEI'
        ? require('/public/static/images/tokens/dei.svg')
        : require('/public/static/images/fallback/ticker.png')
    } catch (err) {
      return require('/public/static/images/fallback/ticker.png')
    }
  }, [id, symbol])
}
