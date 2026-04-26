import { useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '../../store/uiStore'
import type { City } from '../../data/cities'
import './InfoCard.css'

export function InfoCard() {
  const selectedCity = useUIStore((s) => s.selectedCity)
  const setSelectedCity = useUIStore((s) => s.setSelectedCity)
  const cardRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setSelectedCity(null), [setSelectedCity])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [close])

  if (!selectedCity) return null

  return (
    <div className="info-card-overlay">
      <div ref={cardRef} className="info-card">
        <button className="info-card-close" onClick={close}>&times;</button>
        <h2 className="info-card-name">{selectedCity.name}</h2>
        <p className="info-card-desc">{selectedCity.description}</p>
        <div className="info-card-grid">
          <div className="info-card-row">
            <span className="info-card-label">国家</span>
            <span>{selectedCity.country}</span>
          </div>
          <div className="info-card-row">
            <span className="info-card-label">时区</span>
            <span>{selectedCity.timezone ?? '—'}</span>
          </div>
          <div className="info-card-row">
            <span className="info-card-label">纬度</span>
            <span>{selectedCity.lat.toFixed(4)}°</span>
          </div>
          <div className="info-card-row">
            <span className="info-card-label">经度</span>
            <span>{selectedCity.lng.toFixed(4)}°</span>
          </div>
          <div className="info-card-row">
            <span className="info-card-label">人口</span>
            <span>{(selectedCity.population / 10000).toFixed(0)} 万</span>
          </div>
          <div className="info-card-row">
            <span className="info-card-label">海拔</span>
            <span>{selectedCity.altitude != null ? `${selectedCity.altitude} m` : '—'}</span>
          </div>
          <div className="info-card-row">
            <span className="info-card-label">GDP</span>
            <span>{selectedCity.gdp ?? '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
