import { combineReducers } from '@reduxjs/toolkit'

import application from './application/reducer'
import conducted from './conducted/reducer'
import details from './details/reducer'
import multicall from './multicall/reducer'
import portfolio from './portfolio/reducer'
import quotes from './quotes/reducer'
import signatures from './signatures/reducer'
import trade from './trade/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'

const reducer = combineReducers({
  application,
  conducted,
  details,
  multicall,
  portfolio,
  quotes,
  signatures,
  trade,
  transactions,
  user,
})

export default reducer
