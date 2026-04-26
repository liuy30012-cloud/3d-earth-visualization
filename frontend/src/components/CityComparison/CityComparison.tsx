import { useState } from 'react'
import type { City } from '../../data/cities'
import './Comparison.css'

function haversineDistance(a: City, b: City): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function CityComparison() {
  const [cityA, setCityA] = useState<City | null>(null)
  const [cityB, setCityB] = useState<City | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleCitySelect(e: Event) {
      if (!visible) return
      const city = (e as CustomEvent<{ city: City }>).detail.city
      if (!cityA) {
        setCityA(city)
      } else if (!cityB && city.name !== cityA.name) {
        setCityB(city)
      } else {
        setCityA(city)
        setCityB(null)
      }
    }
    window.addEventListener('compareCity', handleCitySelect)
    return () => window.removeEventListener('compareCity', handleCitySelect)
  }, [visible, cityA])

  const distance = cityA && cityB ? haversineDistance(cityA, cityB) : null

  return (
    <>
      <button className="comparison-toggle-btn" onClick={() => setVisible(!visible)}>
        {visible ? '关闭对比' : '城市对比'}
      </button>
      {visible && (
        <div className="comparison-panel">
          <h3 className="comparison-title">城市对比</h3>

          <div className="comparison-city-selector">
            {!cityA ? (
              <div className="comparison-empty" onClick={() => {}}>
                点击左侧选择起点城市
              </div>
            ) : (
              <CityInfoCard city={cityA} label="A" />
            )}
            {!cityB ? (
              <div className="comparison-empty">
                点击左侧选择终点城市
              </div>
            ) : (
              <CityInfoCard city={cityB} label="B" />
            )}
          </div>

          {cityA && cityB && (
            <div className="comparison-stats">
              <div className="stat-item">
                <span className="stat-label">球面距离</span>
                <span className="stat-value">{Math.round(distance)} km</span>
              </div>
            </div>
          )}

          <div className="comparison-actions">
            <button className="comparison-clear-btn" onClick={() => { setCityA(null); setCityB(null) }}>
              清除
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function CityInfoCard({ city, label }: { city: City; label: string }) {
  return (
    <div className="comparison-city-card">
      <span className="comparison-city-label">{label}</span>
      <div className="comparison-city-info">
        <h4 className="comparison-city-name">{city.name}</h4>
        <div className="comparison-city-detail">{city.country}</div>
        <div className="comparison-city-detail">
          {city.lat.toFixed(1)}° / {city.lng.toFixed(1)}°
        </div>
        <div className="comparison-city-detail">人口: {city.population > 1e8 ? (city.population / 1e8).toFixed(1) + '亿' : (city.population / 1e4).toFixed(0) + '万'}</div>
        {city.gdp && <div className="comparison-city-detail">GDP: {city.gdp}</div>}
      </div>
    </div>
  )
}
