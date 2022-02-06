import { createReducer } from '@reduxjs/toolkit'

import { updateBalance, updatePrice, updateEquity, updateTotalEquity, removeContract, setShowEquity } from './actions'

export interface Balance {
  balance: string
  price: string
  equity: string
}

export interface Balances {
  [contract: string]: Balance
}

export interface PortfolioState {
  balances: Balances
  showEquity: boolean
  totalEquity: string
}

export const initialState: PortfolioState = {
  balances: {},
  showEquity: true,
  totalEquity: '0',
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBalance, (state, { payload: { contract, balance } }) => {
      if (state.balances[contract]) {
        state.balances[contract]['balance'] = balance
        return
      }
      state.balances = {
        ...state.balances,
        [contract]: {
          balance,
          price: '0',
          equity: '0',
        },
      }
    })
    .addCase(updatePrice, (state, { payload: { contract, price } }) => {
      if (state.balances[contract]) {
        state.balances[contract]['price'] = price
      }
    })
    .addCase(updateEquity, (state, { payload: { contract, equity } }) => {
      if (state.balances[contract]) {
        state.balances[contract]['equity'] = equity
      }
    })
    .addCase(updateTotalEquity, (state, { payload }) => {
      state.totalEquity = payload
    })
    .addCase(removeContract, (state, { payload: { contract } }) => {
      if (state.balances[contract]) {
        delete state.balances[contract]
      }
    })
    .addCase(setShowEquity, (state, { payload }) => {
      state.showEquity = payload
    })
)
