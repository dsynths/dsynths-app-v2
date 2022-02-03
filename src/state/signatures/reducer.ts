import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { AppState, useAppSelector } from 'state'
import { INFO_BASE_URL, ORACLE_NETWORK_NAMES } from 'constants/oracle'
import { makeHttpRequest } from 'utils/http'

export enum SignaturesStatus {
  OK = 'OK',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

export interface Signature {
  multiplier: number
  signs: {
    sell: {
      v: number
      r: string
      s: string
    }
    buy: {
      v: number
      r: string
      s: string
    }
  }
  price: string
  fee: number
  blockNo: number
  index: number
}

export interface Signatures {
  [contract: string]: Signature
}

interface SignaturesState {
  status: SignaturesStatus
  signatures: {
    [chainId: number]: Signatures
  }
}

const initialState = {
  status: SignaturesStatus.LOADING,
  signatures: {},
}

export const fetchSignatures = createAsyncThunk('signatures/fetchSignatures', async () => {
  const results = await Promise.allSettled(
    Object.entries(ORACLE_NETWORK_NAMES).map(async ([chainId, networkName]) => {
      const { href: url } = new URL(`/${networkName}/signatures.json`, INFO_BASE_URL)
      const response: Signatures = await makeHttpRequest(url)
      return {
        chainId: Number(chainId),
        result: response,
      }
    })
  )

  // Bind results to according network
  return results.reduce((acc: { [chainId: number]: Signatures }, res) => {
    if (res.status !== 'fulfilled') return acc
    acc[res.value.chainId] = res.value.result
    return acc
  }, {})
})

const signaturesSlice = createSlice({
  name: 'signatures',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSignatures.pending, (state) => {
        state.status = SignaturesStatus.LOADING
      })
      .addCase(fetchSignatures.fulfilled, (state, { payload }) => {
        state.status = SignaturesStatus.OK
        state.signatures = payload
      })
      .addCase(fetchSignatures.rejected, () => {
        console.log('Unable to fetch signatures')
        return {
          ...initialState,
          status: SignaturesStatus.ERROR,
        }
      })
  },
})

const { reducer } = signaturesSlice
export default reducer

export function useSignaturesState(): SignaturesState {
  return useAppSelector((state: AppState) => state.signatures)
}
