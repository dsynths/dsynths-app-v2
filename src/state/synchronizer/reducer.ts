import { createSlice } from '@reduxjs/toolkit'
import { Sector } from 'state/details/reducer'

export enum SynchronizerStatus {
  OK = 'OK',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

export interface SynchronizerState {
  status: SynchronizerStatus
  partnerFee: {
    [Sector.STOCKS]: string
    [Sector.CRYPTO]: string
    [Sector.FOREX]: string
  }
  platformFee: {
    [Sector.STOCKS]: string
    [Sector.CRYPTO]: string
    [Sector.FOREX]: string
  }
}

const initialState = {
  status: SynchronizerStatus.LOADING,
  partnerFee: {
    [Sector.STOCKS]: '0',
    [Sector.CRYPTO]: '0',
    [Sector.FOREX]: '0',
  },
  platformFee: {
    [Sector.STOCKS]: '0',
    [Sector.CRYPTO]: '0',
    [Sector.FOREX]: '0',
  },
}

const synchronizerSlice = createSlice({
  name: 'synchronizer',
  initialState,
  reducers: {
    updatePlatformFee: (state, { payload }) => {
      state.platformFee = {
        ...state.platformFee,
        ...payload,
      }
    },
    updatePartnerFee: (state, { payload }) => {
      state.partnerFee = {
        ...state.partnerFee,
        ...payload,
      }
    },
  },
})

const { actions, reducer } = synchronizerSlice
export const { updatePlatformFee, updatePartnerFee } = actions
export default reducer
