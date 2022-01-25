import { useEffect } from 'react'
import { useAppDispatch, AppThunkDispatch } from 'state'

import { fetchSignatures } from './reducer'

export default function Updater() {
  const thunkDispatch: AppThunkDispatch = useAppDispatch()

  useEffect(() => {
    thunkDispatch(fetchSignatures()) // TODO: how often should we refresh?
  }, [thunkDispatch])

  return null
}
