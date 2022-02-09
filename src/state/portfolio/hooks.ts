import { useCallback, useMemo } from 'react'
import { AppState, useAppDispatch, useAppSelector } from 'state'

import { setShowEquity } from './actions'
import { Balances, PortfolioState } from './reducer'

export function usePortfolio(): PortfolioState {
  return useAppSelector((state: AppState) => state.portfolio)
}

export function useActiveBalances(): Balances {
  const portfolio = usePortfolio()
  return useMemo(() => portfolio.balances, [portfolio])
}

export function useShowEquity(): boolean {
  const portfolio = usePortfolio()
  return useMemo(() => portfolio.showEquity, [portfolio])
}

export function useToggleEquity() {
  const dispatch = useAppDispatch()
  const show = useShowEquity()
  return useCallback(() => dispatch(setShowEquity(!show)), [dispatch, show])
}

export function useTotalEquity(): string {
  const portfolio = usePortfolio()
  return useMemo(() => portfolio.totalEquity, [portfolio])
}
