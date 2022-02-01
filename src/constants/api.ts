export const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? new URL('http://localhost:4000')
    : process.env.NODE_ENV === 'production'
    ? new URL('https://api.dsynths.com')
    : new URL('https://api-staging.dsynths.com')
