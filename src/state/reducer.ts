import { combineReducers } from '@reduxjs/toolkit'

import application from './application/reducer'
import multicall from './multicall/reducer'
import portfolio from './portfolio/reducer'
import synchronizer from 'lib/synchronizer/instance'
import trade from './trade/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'

const reducer = combineReducers({
  application,
  multicall,
  portfolio,
  trade,
  transactions,
  user,
  ...synchronizer.slices,
})

export default reducer
