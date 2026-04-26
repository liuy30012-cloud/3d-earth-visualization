import { useUIStore } from '../store/uiStore'
import './LoadingScreen.css'

export function LoadingScreen() {
  const isLoaded = useUIStore((s) => s.isLoaded)
  const loadingProgress = useUIStore((s) => s.loadingProgress)

  if (isLoaded) return null

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-earth" />
        <h2 className="loading-title">正在加载地球...</h2>
        <div className="loading-bar-container">
          <div className="loading-bar" style={{ width: `${loadingProgress}%` }} />
        </div>
        <p className="loading-subtitle">{loadingProgress < 100 ? `${Math.round(loadingProgress)}%` : '加载中...'}</p>
      </div>
    </div>
  )
}
