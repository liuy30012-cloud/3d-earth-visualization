import { useState, useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useIsMobile } from '../../hooks/useResponsive'
import { cities, CONTINENTS, getUniqueCountries } from '../../data/cities'
import { applyFilter } from '../../utils/filter'
import './LayerPanel.css'

const LAYERS: { key: 'borders' | 'markers' | 'flylines' | 'heatmap' | 'barchart' | 'dayNight'; label: string; icon: string }[] = [
  { key: 'borders', label: '国界线', icon: '🌐' },
  { key: 'markers', label: '城市标记', icon: '📍' },
  { key: 'flylines', label: '飞线动画', icon: '✈️' },
  { key: 'heatmap', label: '热力图', icon: '🔥' },
  { key: 'barchart', label: '3D柱状图', icon: '📊' },
  { key: 'dayNight', label: '昼夜分界', icon: '🌓' },
]

const COUNTRY_OPTIONS = getUniqueCountries()

export function LayerPanel() {
  const layers = useUIStore((s) => s.layers)
  const toggleLayer = useUIStore((s) => s.toggleLayer)
  const filter = useUIStore((s) => s.filter)
  const setFilter = useUIStore((s) => s.setFilter)
  const resetFilter = useUIStore((s) => s.resetFilter)
  const flylineMode = useUIStore((s) => s.flylineMode)
  const setFlylineMode = useUIStore((s) => s.setFlylineMode)
  const customFlylineStart = useUIStore((s) => s.customFlylineStart)
  const setCustomFlylineStart = useUIStore((s) => s.setCustomFlylineStart)
  const customFlylineEnd = useUIStore((s) => s.customFlylineEnd)
  const setCustomFlylineEnd = useUIStore((s) => s.setCustomFlylineEnd)
  const earthTheme = useUIStore((s) => s.earthTheme)
  const setEarthTheme = useUIStore((s) => s.setEarthTheme)
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(isMobile)
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    setCollapsed(isMobile)
  }, [isMobile])

  const filteredCount = cities.filter(applyFilter(filter)).length

  return (
    <>
      {isMobile && !collapsed && (
        <button className="layer-panel-toggle-btn" onClick={() => setCollapsed(false)}>
          图层
        </button>
      )}
      <div className={`layer-panel ${collapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
        {isMobile && (
          <button className="layer-panel-close" onClick={() => setCollapsed(true)}>
            &times;
          </button>
        )}
        <h3 className="layer-panel-title">图层控制</h3>
        {LAYERS.map(({ key, label, icon }) => (
          <label key={key} className="layer-toggle">
            <span className="layer-icon">{icon}</span>
            <span className="layer-label">{label}</span>
            <span className={`layer-switch ${layers[key] ? 'on' : 'off'}`} />
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => toggleLayer(key)}
              className="layer-checkbox"
            />
          </label>
        ))}

        <div className="filter-section">
          <button className="filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
            {showFilter ? '收起筛选' : '城市筛选'} ({filteredCount}/{cities.length})
          </button>
          {showFilter && (
            <div className="filter-content">
              <FilterGroup label="大洲" selected={filter.continent} options={CONTINENTS} onChange={(v) => setFilter({ continent: v })} />
              <FilterGroup label="国家" selected={filter.countries} options={COUNTRY_OPTIONS} onChange={(v) => setFilter({ countries: v })} />
              <button className="filter-reset-btn" onClick={resetFilter}>
                重置筛选
              </button>
            </div>
          )}
        </div>

        <div className="flyline-mode-section">
          <button
            className={`flyline-mode-btn ${flylineMode ? 'active' : ''}`}
            onClick={() => {
              setFlylineMode(!flylineMode)
              if (flylineMode) {
                setCustomFlylineStart(null)
                setCustomFlylineEnd(null)
              }
            }}
          >
            {flylineMode
              ? `点击城市: ${customFlylineStart ? customFlylineStart.name : '起点'} → ${customFlylineEnd ? customFlylineEnd.name : '终点'}`
              : '自定义飞线'}
          </button>
        </div>

        <div className="theme-section">
          <span className="theme-label">地球主题</span>
          <div className="theme-options">
            <button className={`theme-btn ${earthTheme === 'satellite' ? 'active' : ''}`} onClick={() => setEarthTheme('satellite')}>卫星图</button>
            <button className={`theme-btn ${earthTheme === 'dark' ? 'active' : ''}`} onClick={() => setEarthTheme('dark')}>暗色</button>
            <button className={`theme-btn ${earthTheme === 'terrain' ? 'active' : ''}`} onClick={() => setEarthTheme('terrain')}>地形</button>
          </div>
        </div>
      </div>
    </>
  )
}

function FilterGroup({
  label,
  selected,
  options,
  onChange,
}: {
  label: string
  selected: string[]
  options: string[]
  onChange: (v: string[]) => void
}) {
  return (
    <div className="filter-group">
      <span className="filter-group-label">{label}</span>
      <div className="filter-chips">
        {options.map((opt) => (
          <button
            key={opt}
            className={`filter-chip ${selected.includes(opt) ? 'active' : ''}`}
            onClick={() => {
              const next = selected.includes(opt)
                ? selected.filter((s) => s !== opt)
                : [...selected, opt]
              onChange(next)
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
