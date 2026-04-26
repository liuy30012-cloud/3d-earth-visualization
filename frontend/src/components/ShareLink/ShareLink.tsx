import { useState, useCallback } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useIsMobile } from '../../hooks/useResponsive'
import './ShareLink.css'

function encodeState(cameraPos: [number, number, number], layers: Record<string, boolean>, theme: string): string {
  const params = new URLSearchParams()
  params.set('c', cameraPos.map((n) => n.toFixed(2)).join(','))
  const activeLayers = Object.entries(layers).filter(([, v]) => v).map(([k]) => k)
  if (activeLayers.length > 0) params.set('l', activeLayers.join(','))
  if (theme !== 'satellite') params.set('t', theme)
  return params.toString()
}

export function ShareLink() {
  const [showCopied, setShowCopied] = useState(false)
  const layers = useUIStore((s) => s.layers)
  const earthTheme = useUIStore((s) => s.earthTheme)
  const isMobile = useIsMobile()

  const getShareUrl = useCallback(() => {
    const camPos = (window as any).__cameraPosition
    const pos = camPos ? [camPos.x, camPos.y, camPos.z] as [number, number, number] : [0, 0, 6]
    const params = encodeState(pos, layers, earthTheme)
    return `${window.location.origin}${window.location.pathname}?${params}`
  }, [layers, earthTheme])

  const copyLink = useCallback(() => {
    const url = getShareUrl()
    navigator.clipboard.writeText(url).then(() => {
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    })
  }, [getShareUrl])

  return (
    <button className={`share-link-btn ${isMobile ? 'mobile' : ''}`} onClick={copyLink}>
      {showCopied ? '已复制' : '分享链接'}
    </button>
  )
}
