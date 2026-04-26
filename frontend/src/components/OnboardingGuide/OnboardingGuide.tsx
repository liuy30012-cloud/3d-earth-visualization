import { useState, useEffect } from 'react'
import './OnboardingGuide.css'

const STEPS = [
  {
    title: '欢迎使用 3D 地球',
    desc: '这是一个交互式 3D 地球可视化项目',
    icon: '🌍',
  },
  {
    title: '拖拽旋转',
    desc: '按住鼠标左键拖拽，旋转地球查看不同区域',
    icon: '🖱️',
  },
  {
    title: '滚轮缩放',
    desc: '滚动鼠标滚轮可以拉近或拉远视角',
    icon: '🔍',
  },
  {
    title: '点击城市',
    desc: '点击红色标记点查看城市详细信息',
    icon: '📍',
  },
  {
    title: '探索功能',
    desc: '使用顶部搜索框查找城市，右侧面板切换图层',
    icon: '✨',
  },
]

export function OnboardingGuide() {
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('guide-dismissed')
    if (!dismissed) {
      setTimeout(() => setVisible(true), 600)
    }
  }, [])

  if (!visible) return null

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1

  return (
    <div className="onboarding-overlay" onClick={() => setVisible(false)}>
      <div className="onboarding-card" onClick={(e) => e.stopPropagation()}>
        <button className="onboarding-close" onClick={() => setVisible(false)}>&times;</button>
        <div className="onboarding-icon">{step.icon}</div>
        <h3 className="onboarding-title">{step.title}</h3>
        <p className="onboarding-desc">{step.desc}</p>
        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === currentStep ? 'active' : ''}`} />
          ))}
        </div>
        <div className="onboarding-actions">
          {currentStep > 0 && (
            <button className="onboarding-btn secondary" onClick={() => setCurrentStep((s) => s - 1)}>
              上一步
            </button>
          )}
          <button
            className="onboarding-btn primary"
            onClick={() => {
              if (isLast) {
                localStorage.setItem('guide-dismissed', 'true')
                setVisible(false)
              } else {
                setCurrentStep((s) => s + 1)
              }
            }}
          >
            {isLast ? '开始探索' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}
