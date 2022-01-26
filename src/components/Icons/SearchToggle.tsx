import { Search } from 'react-feather'

import { useIsDarkMode } from 'state/user/hooks'
import { IconWrapper } from './index'

export default function SearchToggle({ size }: { size?: number }) {
  const darkMode = useIsDarkMode()

  return darkMode ? (
    <IconWrapper>
      <Search opacity={0.6} size={size ?? 16} />
    </IconWrapper>
  ) : (
    <IconWrapper>
      <Search opacity={0.6} size={size ?? 16} />
    </IconWrapper>
  )
}
