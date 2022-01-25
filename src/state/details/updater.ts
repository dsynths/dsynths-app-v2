import { useEffect } from 'react'
import { useAppDispatch, AppThunkDispatch } from 'state'

import { fetchDetails } from './reducer'

export default function Updater() {
  const thunkDispatch: AppThunkDispatch = useAppDispatch()

  useEffect(() => {
    thunkDispatch(fetchDetails()) // TODO: how often should we refresh?
  }, [thunkDispatch])

  return null
}
