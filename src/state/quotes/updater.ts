import { useEffect } from 'react'
import { useAppDispatch, AppThunkDispatch } from 'state'

import { fetchQuotes } from './reducer'

export default function Updater() {
  const thunkDispatch: AppThunkDispatch = useAppDispatch()

  useEffect(() => {
    thunkDispatch(fetchQuotes()) // TODO: how often should we refresh?
  }, [thunkDispatch])

  return null
}
