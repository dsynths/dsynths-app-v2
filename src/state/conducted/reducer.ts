import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { AppState, useAppSelector } from 'state'
import { INFO_BASE_URL, ORACLE_NETWORK_NAMES } from 'constants/oracle'
import { makeHttpRequest } from 'utils/http'

export enum ConductedStatus {
  OK = 'OK',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

interface OracleResponse {
  count: number
  tokens: {
    id: string
    long: string
    short: string
  }[]
}

export type Conducted = {
  id: string
  long: string
  short: string
}

interface ConductedState {
  status: ConductedStatus
  conducted: {
    [chainId: number]: Conducted[]
  }
}

const initialState = {
  status: ConductedStatus.LOADING,
  conducted: {},
}

export const fetchConducted = createAsyncThunk('conducted/fetchConducted', async () => {
  const results = await Promise.allSettled(
    Object.entries(ORACLE_NETWORK_NAMES).map(async ([chainId, networkName]) => {
      const { href: url } = new URL(`/${networkName}/conducted.json`, INFO_BASE_URL)
      const response: OracleResponse = await makeHttpRequest(url)
      return {
        chainId: Number(chainId),
        result: response.tokens,
      }
    })
  )

  // Bind results to according network
  return results.reduce((acc: { [chainId: number]: Conducted[] }, res) => {
    if (res.status !== 'fulfilled') return acc
    acc[res.value.chainId] = res.value.result
    return acc
  }, {})
})

const conductedSlice = createSlice({
  name: 'conducted',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConducted.pending, (state) => {
        state.status = ConductedStatus.LOADING
      })
      .addCase(fetchConducted.fulfilled, (state, { payload }) => {
        state.status = ConductedStatus.OK
        state.conducted = payload
      })
      .addCase(fetchConducted.rejected, () => {
        console.log('Unable to fetch conducted')
        return {
          ...initialState,
          status: ConductedStatus.ERROR,
        }
      })
  },
})

const { reducer } = conductedSlice
export default reducer

export function useConductedState(): ConductedState {
  return useAppSelector((state: AppState) => state.conducted)
}
