import { useEffect, useState } from 'react'

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    function update() {
      const w = window.innerWidth
      if (w < 768) setBreakpoint('mobile')
      else if (w < 1024) setBreakpoint('tablet')
      else setBreakpoint('desktop')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return breakpoint
}

export function useIsMobile() {
  return useResponsive() === 'mobile'
}

export function useIsTablet() {
  return useResponsive() === 'tablet'
}
