export const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? new URL('https://api-staging.dsynths.com')
    : new URL('https://api.dsynths.com')
