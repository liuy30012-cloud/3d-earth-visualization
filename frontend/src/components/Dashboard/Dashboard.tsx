import { useState, useEffect } from 'react'
import { useIsMobile } from '../../hooks/useResponsive'
import { flylinePairs } from '../Flylines/Flylines'
import { cities, CONTINENTS } from '../../data/cities'
import './Dashboard.css'

const TOTAL_POPULATION = cities.reduce((sum, c) => sum + c.population, 0)
const TOTAL_GDP_CITIES = cities.filter((c) => c.gdp).length
const TOTAL_FLYLINES = flylinePairs.length

export function Dashboard() {
  const isMobile = useIsMobile()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!isMobile)
  }, [isMobile])

  const continentData = CONTINENTS.map((c) => ({
    name: c,
    count: cities.filter((city) => city.continent === c).length,
  })).filter((d) => d.count > 0)

  const maxCount = Math.max(...continentData.map((d) => d.count))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const popFormatter = (pop: number) => {
    if (pop >= 1e8) return (pop / 1e8).toFixed(1) + ' 亿'
    if (pop >= 1e4) return (pop / 1e4).toFixed(0) + ' 万'
    return pop.toString()
  }

  return (
    <>
      <button className="dashboard-toggle-btn" onClick={() => setVisible(!visible)}>
        {visible ? '关闭面板' : '数据面板'}
      </button>
      <div className={`dashboard-panel ${visible ? '' : 'hidden'} ${isMobile ? 'mobile' : ''}`}>
        <h3 className="dashboard-title">全球统计</h3>

        <div className="stat-section">
          <div className="stat-item">
            <span className="stat-label">城市总数</span>
            <span className="stat-value">{cities.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">总人口</span>
            <span className="stat-value">{popFormatter(TOTAL_POPULATION)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">GDP数据</span>
            <span className="stat-value">{TOTAL_GDP_CITIES}/{cities.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">飞线数</span>
            <span className="stat-value">{TOTAL_FLYLINES}</span>
          </div>
        </div>

        <div className="stat-section">
          <h4 className="section-subtitle">大洲分布</h4>
          <div className="pie-chart-container">
            <div className="pie-chart" style={{ background: `conic-gradient(${continentData
              .map((d, i) => `${COLORS[i]} ${Math.round((d.count / cities.length) * 360)}deg`)
              .join(', ')})` }} />
          </div>
          <div className="continent-list">
            {continentData.map((d, i) => (
              <div key={d.name} className="continent-row">
                <span className="continent-dot" style={{ backgroundColor: COLORS[i] }} />
                <span className="continent-name">{d.name}</span>
                <span className="continent-bar-bg">
                  <span
                    className="continent-bar-fill"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </span>
                <span className="continent-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
