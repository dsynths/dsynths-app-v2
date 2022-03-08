import { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled, { useTheme } from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import { useCurrency } from 'hooks/useCurrency'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { Card } from 'components/Card'
import { PrimaryButton } from 'components/Button'
import { Loader } from 'components/Icons'
import { useRegistrarByContract } from 'lib/synchronizer/hooks'

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

const RegistrarContainer = styled.div`
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

export default function RegistrarCard() {
  const { account } = useWeb3React()
  const theme = useTheme()
  const router = useRouter()

  const contract = useMemo(() => {
    const registrarId = router.query?.registrarId
    return typeof registrarId === 'string' ? registrarId : ''
  }, [router])

  const registrar = useRegistrarByContract(contract)
  const currency = useCurrency(registrar?.contract)
  const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const registrarOraclePrice = registrar?.price ?? '0'

  return (
    <Wrapper>
      <TitleContainer>
        <PrimaryLabel>Equity</PrimaryLabel>
        <SecondaryLabel>45.65%</SecondaryLabel>
      </TitleContainer>
      <RegistrarContainer>
        <EquityContainer>${balance?.multiply(registrarOraclePrice)?.toSignificant(6)}</EquityContainer>
      </RegistrarContainer>
      <SecondaryLabel>
        {balance ? (
          <div>
            {balance?.toSignificant(6)} {registrar?.ticker}
          </div>
        ) : (
          <Loader size="12.5px" duration={'3s'} stroke={theme.text2} />
        )}
      </SecondaryLabel>
      <Divider />
      <PrimaryButton style={{ margin: '16px 0px' }}>
        <Link href={`/trade?registrarId=${registrar?.contract}`}>
          <a>TRADE {registrar?.ticker}</a>
        </Link>
      </PrimaryButton>
    </Wrapper>
  )
}
