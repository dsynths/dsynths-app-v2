declare global {
  namespace NodeJS {
    interface Process {
      NODE_ENV: 'development' | 'production'
      NEXT_PUBLIC_INFURA_KEY: string
      NEXT_PUBLIC_PORTIS_ID?: string
      NEXT_PUBLIC_FORTMATIC_KEY?: string
    }
  }

  interface Window {
    walletLinkExtension?: any
    ethereum?: {
      isCoinbaseWallet?: true
      isMetaMask?: true
      on?: (...args: any[]) => void
      removeListener?: (...args: any[]) => void
      removeAllListeners?: (...args: any[]) => void
      autoRefreshOnNetworkChange?: boolean
    }
    web3?: Record<string, unknown>
  }
}

export {}
