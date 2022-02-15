import { useEffect } from 'react'
import { useAppDispatch, AppThunkDispatch } from 'state'

import { fetchQuotes } from './reducer'

export default function Updater() {
  const thunkDispatch: AppThunkDispatch = useAppDispatch()

  useEffect(() => {
    // TODO: find out why this triggers a request to our API
    const loop = setInterval(() => thunkDispatch(fetchQuotes()), 60 * 1000)
    thunkDispatch(fetchQuotes())
    return () => clearInterval(loop)
  }, [thunkDispatch])

  return null
}
