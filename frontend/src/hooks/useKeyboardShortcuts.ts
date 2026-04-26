import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'

const LAYER_KEYS = ['borders', 'markers', 'flylines', 'heatmap'] as const
type LayerKey = (typeof LAYER_KEYS)[number]

export function useKeyboardShortcuts(cameraReset: () => void) {
  const toggleLayer = useUIStore((s) => s.toggleLayer)
  const layers = useUIStore((s) => s.layers)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case 'r':
          cameraReset()
          break
        case ' ':
          e.preventDefault()
          toggleLayer('flylines')
          break
        case 'f':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {})
          } else {
            document.exitFullscreen().catch(() => {})
          }
          break
        case '1':
          toggleLayer('borders')
          break
        case '2':
          toggleLayer('markers')
          break
        case '3':
          toggleLayer('flylines')
          break
        case '4':
          toggleLayer('heatmap')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cameraReset, toggleLayer])
}
