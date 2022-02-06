import { createAction } from '@reduxjs/toolkit'

export const updateBalance = createAction<{ contract: string; balance: string }>('portfolio/updateBalance')
export const updatePrice = createAction<{ contract: string; price: string }>('portfolio/updatePrice')
export const updateEquity = createAction<{ contract: string; equity: string }>('portfolio/updateEquity')
export const updateTotalEquity = createAction<string>('portfolio/updateTotalEquity')
export const removeContract = createAction<{ contract: string }>('portfolio/removeContract')
export const setShowEquity = createAction<boolean>('portfolio/setShowEquity')
