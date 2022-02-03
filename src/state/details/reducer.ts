import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { AppState, useAppSelector } from 'state'
import { INFO_BASE_URL } from 'constants/oracle'
import { makeHttpRequest } from 'utils/http'

export enum DetailsStatus {
  OK = 'OK',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

export enum Sector {
  STOCKS = 'STOCKS',
  CRYPTO = 'CRYPTO',
}

interface DetailsState {
  status: DetailsStatus
  details: {
    [symbol: string]: {
      name: string
      sector: Sector
      symbol: string
      shortSymbol: string
      longSymbol: string
    }
  }
}

const initialState = {
  status: DetailsStatus.LOADING,
  details: {},
}

export const fetchDetails = createAsyncThunk('details/fetchDetails', async () => {
  const { href: url } = new URL(`/registrar-detail.json`, INFO_BASE_URL)
  const response: {
    [symbol: string]: {
      name: string
      sector: string
      symbol: string
      short_symbol: string
      long_symbol: string
    }
  } = await makeHttpRequest(url)
  return Object.entries(response).reduce((acc: DetailsState['details'], [symbol, data]) => {
    acc[symbol] = {
      name: data.name,
      sector: data.sector === 'stock' || data.sector === 'xDai-stock' ? Sector.STOCKS : Sector.CRYPTO,
      symbol: data.symbol,
      shortSymbol: data.short_symbol,
      longSymbol: data.long_symbol,
    }
    return acc
  }, {})
})

const detailsSlice = createSlice({
  name: 'details',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDetails.pending, (state) => {
        state.status = DetailsStatus.LOADING
      })
      .addCase(fetchDetails.fulfilled, (state, { payload }) => {
        state.status = DetailsStatus.OK
        state.details = payload
      })
      .addCase(fetchDetails.rejected, () => {
        console.log('Unable to fetch details')
        return {
          ...initialState,
          status: DetailsStatus.ERROR,
        }
      })
  },
})

const { reducer } = detailsSlice
export default reducer

export function useDetailsState(): DetailsState {
  return useAppSelector((state: AppState) => state.details)
}
