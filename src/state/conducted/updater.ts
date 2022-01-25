import { useEffect } from 'react'
import { useAppDispatch, AppThunkDispatch } from 'state'

import { fetchConducted } from './reducer'

export default function Updater() {
  const thunkDispatch: AppThunkDispatch = useAppDispatch()

  useEffect(() => {
    thunkDispatch(fetchConducted()) // TODO: how often should we refresh?
  }, [thunkDispatch])

  return null
}
