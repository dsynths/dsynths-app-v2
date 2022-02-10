import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { SupportedThemes } from 'theme'

export function useIsDedicatedTheme() {
  const router = useRouter()
  return useMemo(() => {
    const parsed = router.query?.theme
    const parsedTheme = parsed && typeof parsed === 'string' ? parsed : undefined
    return parsedTheme && Object.values(SupportedThemes).some((theme: string) => theme === parsedTheme)
  }, [router])
}

export function useIsJadeTheme() {
  const router = useRouter()
  return useMemo(() => {
    return router.query?.theme === 'jade'
  }, [router])
}
