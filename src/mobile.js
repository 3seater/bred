import { useEffect, useState } from 'react'

export const MOBILE_QUERY = '(max-width: 760px), (pointer: coarse) and (max-height: 500px)'
export const isMobile = () => window.matchMedia(MOBILE_QUERY).matches
export function useMobile() {
  const [mobile, setMobile] = useState(isMobile)
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    const update = () => setMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return mobile
}
