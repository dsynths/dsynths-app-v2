import React, { useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import useWeb3React from 'hooks/useWeb3'
import { useNetworkModalToggle } from 'state/application/hooks'
import { ChainInfo } from 'constants/chainInfo'

import NetworkModal from 'components/NetworkModal'
import { NavButton } from 'components/Button'

const Text = styled.p`
  width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
  margin-left: 10px;
`

export default function Web3Network() {
  const { chainId } = useWeb3React()
  const toggleNetworkModal = useNetworkModalToggle()

  const Chain = useMemo(() => {
    return chainId && chainId in ChainInfo ? ChainInfo[chainId] : null
  }, [chainId])

  return Chain ? (
    <>
      <NavButton onClick={() => toggleNetworkModal()}>
        <Image src={Chain.logoUrl} alt={Chain.label} width={20} height={20} />
        <Text>{Chain.label}</Text>
      </NavButton>
      <NetworkModal />
    </>
  ) : null
}
