import { Card } from 'components/Card'
import useWeb3React from 'hooks/useWeb3'
import styled, { useTheme } from 'styled-components'
import ChainLabel from 'components/Icons/ChainLabel'
import { PrimaryButton } from 'components/Button'
import Link from 'next/link'
import { Loader } from 'components/Icons'
import { useAssetByContract } from 'hooks/useAssetList'
import { useCurrency } from 'hooks/useCurrency'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

const Wrapper = styled(Card)`
  padding: 1.5rem 1.8rem;
`

const TitleContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 0.25rem;
`

const AssetContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 1rem;
  padding: 0.25rem 0rem;
  align-items: center;
`

const EquityContainer = styled.div`
  font-size: 30px;
  line-height: 37px;
  color: ${({ theme }) => theme.text1};
`

const Divider = styled.div`
  margin: 1.5rem 0rem;
  border: 1px solid ${({ theme }) => theme.text2};
`

const PrimaryLabel = styled.div`
  font-weight: normal;
  font-size: 12.5px;
  line-height: 20px;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.text1};
`
const SecondaryLabel = styled.div`
  font-weight: normal;
  font-size: 12.5px;
  line-height: 20px;
  color: ${({ theme }) => theme.text2};
`

export default function AssetCard() {
  const { chainId, account } = useWeb3React()
  const theme = useTheme()
  const router = useRouter()

  const contract = useMemo(() => {
    const assetId = router.query?.assetId
    return typeof assetId === 'string' ? assetId : undefined
  }, [router])

  const asset = useAssetByContract(contract)
  const currency = useCurrency(asset?.contract)
  const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const assetOraclePrice = asset?.price ?? '0'

  return (
    <Wrapper>
      <TitleContainer>
        <PrimaryLabel>Equity</PrimaryLabel>
        <SecondaryLabel>
          {/* {assetList.length > 0 ? assetList.length : <Loader size="12.5px" duration={'3s'} stroke={theme.text2} />} */}
          45.65%
        </SecondaryLabel>
      </TitleContainer>
      <AssetContainer>
        <EquityContainer>${balance?.multiply(assetOraclePrice)?.toSignificant(6)}</EquityContainer>
        {chainId && <ChainLabel chainId={chainId} />}
      </AssetContainer>
      <SecondaryLabel>
        {balance ? (
          <div>
            {balance?.toSignificant(6)} {asset?.ticker}
          </div>
        ) : (
          <Loader size="12.5px" duration={'3s'} stroke={theme.text2} />
        )}
      </SecondaryLabel>
      <Divider />
      <PrimaryButton style={{ margin: '16px 0px' }}>
        <Link href={`/trade?assetId=${asset?.contract}`}>
          <a>TRADE {asset?.ticker}</a>
        </Link>
      </PrimaryButton>
    </Wrapper>
  )
}
