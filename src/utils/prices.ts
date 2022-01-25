import { Percent, JSBI } from '@sushiswap/core-sdk'

export const PERCENT_DENOMINATOR = 100
export const PERCENT_SCALE = 10000
export const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(PERCENT_SCALE), JSBI.BigInt(PERCENT_SCALE))

export function constructPercentage(value: number) {
  return new Percent(JSBI.BigInt(value * PERCENT_SCALE), PERCENT_DENOMINATOR * PERCENT_SCALE).multiply(
    PERCENT_DENOMINATOR
  )
}
