import { useState, useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useIsMobile } from '../../hooks/useResponsive'
import './LayerPanel.css'

const LAYERS: { key: 'borders' | 'markers' | 'flylines' | 'heatmap'; label: string; icon: string }[] = [
  { key: 'borders', label: '国界线', icon: '🌐' },
  { key: 'markers', label: '城市标记', icon: '📍' },
  { key: 'flylines', label: '飞线动画', icon: '✈️' },
  { key: 'heatmap', label: '热力图', icon: '🔥' },
]

export function LayerPanel() {
  const layers = useUIStore((s) => s.layers)
  const toggleLayer = useUIStore((s) => s.toggleLayer)
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(isMobile)

  useEffect(() => {
    setCollapsed(isMobile)
  }, [isMobile])

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
      </div>
    </>
  )
}
