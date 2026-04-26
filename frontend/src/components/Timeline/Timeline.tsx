import { useRef, useState, useCallback, useEffect, createContext, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { cities } from '../../data/cities'
import { Flyline } from '../Flylines/Flylines'
import './Timeline.css'

interface TimelineEvent {
  year: number
  label: string
  description: string
  connections: [number, number][]
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: 100,
    label: '丝绸之路 (公元100年)',
    description: '古代丝绸之路连接中国与中亚、欧洲',
    connections: [[0, 8], [8, 7], [7, 26], [26, 20], [20, 22]],
  },
  {
    year: 1420,
    label: '郑和下西洋 (1420年)',
    description: '中国船队远航东南亚、印度洋、非洲',
    connections: [[0, 9], [9, 10], [10, 7], [7, 26], [26, 27]],
  },
  {
    year: 1500,
    label: '大航海时代 (1500年)',
    description: '欧洲探索新大陆与全球航线',
    connections: [[20, 15], [20, 27], [21, 15], [21, 27], [27, 28]],
  },
  {
    year: 1900,
    label: '工业革命后 (1900年)',
    description: '工业城市崛起，全球贸易网络形成',
    connections: [[15, 20], [20, 22], [22, 23], [15, 16], [0, 15]],
  },
  {
    year: 2026,
    label: '现代航线 (2026年)',
    description: '全球航空网络高度发达',
    connections: [[0, 15], [0, 20], [0, 5], [1, 15], [3, 10], [10, 23], [15, 20], [20, 22], [27, 28], [13, 14]],
  },
]

interface TimelineContextType {
  currentIndex: number
  setCurrentIndex: (fn: (prev: number) => number) => void
  visible: boolean
}

export const TimelineContext = createContext<TimelineContextType>({
  currentIndex: 4,
  setCurrentIndex: () => {},
  visible: false,
})

export function useTimeline() {
  return useContext(TimelineContext)
}

export function TimelineFlylines() {
  const { currentIndex, visible } = useTimeline()
  const timeRef = useRef(0)
  useFrame((_, delta) => {
    timeRef.current += delta
  })

  if (!visible) return null

  const current = TIMELINE_EVENTS[currentIndex]

  return (
    <group>
      {current.connections.map(([startIdx, endIdx], i) => (
        <Flyline
          key={`timeline-${currentIndex}-${i}`}
          startCity={cities[startIdx]}
          endCity={cities[endIdx]}
          time={timeRef.current + i * 0.1}
          color={new THREE.Color(0xffaa44)}
        />
      ))}
    </group>
  )
}

export function TimelineUI() {
  const [currentIndex, setCurrentIndex] = useState(TIMELINE_EVENTS.length - 1)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)

  const nextEvent = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TIMELINE_EVENTS.length)
  }, [])

  const prevEvent = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + TIMELINE_EVENTS.length) % TIMELINE_EVENTS.length)
  }, [])

  useEffect(() => {
    let timer: number | undefined
    if (playing && visible) {
      timer = window.setInterval(nextEvent, 3000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [playing, visible, nextEvent])

  const current = TIMELINE_EVENTS[currentIndex]

  return (
    <TimelineContext.Provider value={{ currentIndex, setCurrentIndex, visible }}>
      {!visible ? (
        <button className="timeline-open-btn" onClick={() => setVisible(true)}>
          时间轴
        </button>
      ) : (
        <div className="timeline-panel">
          <button className="timeline-toggle-btn" onClick={() => setVisible(false)}>
            &times;
          </button>
          <h3 className="timeline-title">历史时间轴</h3>

          <div className="timeline-event">
            <div className="timeline-year">{current.year}年</div>
            <div className="timeline-label">{current.label}</div>
            <div className="timeline-desc">{current.description}</div>
          </div>

          <div className="timeline-controls">
            <button className="timeline-nav-btn" onClick={prevEvent}>&lt;</button>
            <button className="timeline-play-btn" onClick={() => setPlaying((p) => !p)}>
              {playing ? '暂停' : '播放'}
            </button>
            <button className="timeline-nav-btn" onClick={nextEvent}>&gt;</button>
          </div>

          <div className="timeline-dots">
            {TIMELINE_EVENTS.map((ev, i) => (
              <span
                key={ev.year}
                className={`timeline-dot ${i === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex((prev) => i)}
              />
            ))}
          </div>
        </div>
      )}
    </TimelineContext.Provider>
  )
}
