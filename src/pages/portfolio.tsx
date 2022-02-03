import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { CurrencyAmount, Token, ZERO } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'

import { useSubAssetList, useTokens } from 'hooks/useAssetList'
import useWeb3React from 'hooks/useWeb3'
import { useTokenBalances } from 'state/wallet/hooks'
import { Portfolio as PortfolioList, EquityChart } from 'components/App/Portfolio'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: clamp(250px, 90%, 512px);
  margin: 0 auto;
  margin-top: 75px;
  gap: 5px;
  overflow: visible;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 30px;
  `}
`

export interface OwnedAsset {
  contract: string
  balance: CurrencyAmount<Token>
  equity: BigNumber
}

export type AssetMap = Array<OwnedAsset>

function sortBalances(a: OwnedAsset, b: OwnedAsset) {
  return a.equity.gte(b.equity) ? -1 : 1
}

export default function Portfolio() {
  const { account } = useWeb3React()
  const assetList = useSubAssetList()
  const assetTokens = useTokens()
  const assetBalances = useTokenBalances(account ?? undefined, assetTokens)
  const [showEquity, setShowEquity] = useState(true)

  const assetMap: AssetMap = useMemo(() => {
    const unsorted = Object.entries(assetBalances).reduce((acc: AssetMap, [contract, balance]) => {
      if (balance.equalTo(ZERO)) return acc

      const asset = assetList.find((asset) => asset.contract === contract)
      const price = asset ? new BigNumber(asset.price) : new BigNumber('0')
      const equity = new BigNumber(balance.toExact()).times(price)
      acc.push({ contract, balance, equity })
      return acc
    }, [])

    return unsorted.sort(sortBalances)
  }, [assetBalances, assetList])

  const totalEquity: BigNumber = useMemo(() => {
    return assetMap.reduce((acc: BigNumber, { equity }) => {
      return acc.plus(equity)
    }, new BigNumber('0'))
  }, [assetMap])

  return (
    <Container>
      <EquityChart showEquity={showEquity} totalEquity={totalEquity} />
      <PortfolioList
        balances={assetBalances}
        assets={assetMap}
        showEquity={showEquity}
        setShowEquity={() => setShowEquity(!showEquity)}
        totalEquity={totalEquity}
      />
    </Container>
  )
}
