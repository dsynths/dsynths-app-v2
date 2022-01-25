import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState, useAppSelector } from 'state'

export enum TypedField {
  A,
  B,
}

export enum TradeType {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
}

export interface TradeState {
  typedValue: string
  typedField: TypedField
  receipient?: string
  attemptingTxn: boolean
  showReview: boolean
  error?: string
}

const initialState: TradeState = {
  typedValue: '',
  typedField: TypedField.A,
  receipient: undefined,
  attemptingTxn: false,
  showReview: false,
  error: undefined,
}

export const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    setTradeState: (state, action: PayloadAction<TradeState>) => {
      state.typedValue = action.payload.typedValue
      state.typedField = action.payload.typedField
      state.attemptingTxn = action.payload.attemptingTxn
      state.showReview = action.payload.showReview
      state.error = action.payload.error
    },
    setReceipient: (state, action: PayloadAction<string | undefined>) => {
      state.receipient = action.payload
    },
    setAttemptingTxn: (state, action: PayloadAction<boolean>) => {
      state.attemptingTxn = action.payload
    },
    setShowReview: (state, action: PayloadAction<boolean>) => {
      state.showReview = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
})

export const { setTradeState, setReceipient, setAttemptingTxn, setShowReview, setError } = tradeSlice.actions

export function useTradeState(): TradeState {
  return useAppSelector((state: AppState) => state.trade)
}

export default tradeSlice.reducer
