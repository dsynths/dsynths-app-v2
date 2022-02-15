import { AppState, useAppSelector } from 'state'

import { QuotesState } from './reducer'

export function useQuotesState(): QuotesState {
  return useAppSelector((state: AppState) => state.quotes)
}
