import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export function createApolloClient(uri) {
  return new ApolloClient({
    link: new HttpLink({
      uri,
    }),
    shouldBatch: true,
    ssrMode: typeof window === 'undefined',
    connectToDevTools: typeof window !== 'undefined' && process.NODE_ENV === 'development',
    cache: new InMemoryCache(),
  })
}
