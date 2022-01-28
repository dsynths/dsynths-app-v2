import { Search as SearchIcon } from 'react-feather'

import { useIsDarkMode } from 'state/user/hooks'
import { IconWrapper } from './index'

export default function Search({ size }: { size?: number }) {
  const darkMode = useIsDarkMode()

  return darkMode ? (
    <IconWrapper>
      <SearchIcon opacity={0.6} size={size ?? 16} />
    </IconWrapper>
  ) : (
    <IconWrapper>
      <SearchIcon opacity={0.6} size={size ?? 16} />
    </IconWrapper>
  )
}
