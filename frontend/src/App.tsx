import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Earth } from './components/Earth/Earth'
import { InfoCard } from './components/InfoCard/InfoCard'
import { LayerPanel } from './components/LayerPanel/LayerPanel'
import { SearchBar } from './components/SearchBar/SearchBar'
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen'
import { AuthModal } from './components/AuthModal/AuthModal'
import { UserButton } from './components/UserButton/UserButton'
import { OnboardingGuide } from './components/OnboardingGuide/OnboardingGuide'
import { ScreenshotButton } from './components/ScreenshotButton/ScreenshotButton'
import { Dashboard } from './components/Dashboard/Dashboard'
import { CityComparison } from './components/CityComparison/CityComparison'
import { TimelineFlylines, TimelineUI } from './components/Timeline/Timeline'
import { ShareLink } from './components/ShareLink/ShareLink'
import { useUIStore } from './store/uiStore'
import { useAuthStore } from './store/authStore'
import { latLongToVector3 } from './utils/coords'
import type { City } from './data/cities'
import './App.css'

const EARTH_RADIUS = 2
const INITIAL_CAMERA_POS = [0, 0, 6] as const

function CameraController() {
  const { camera } = useThree()
  const targetRef = useRef<THREE.Vector3 | null>(null)
  const startPosRef = useRef(new THREE.Vector3())
  const startTimeRef = useRef(0)

  useEffect(() => {
    ;(window as any).__resetCamera = () => {
      targetRef.current = new THREE.Vector3(...INITIAL_CAMERA_POS)
      startPosRef.current.copy(camera.position)
      startTimeRef.current = performance.now()
    }
  }, [camera])

  useEffect(() => {
    const handleCameraTarget = (e: Event) => {
      const city = (e as CustomEvent<{ city: City }>).detail.city
      const target = latLongToVector3(city.lat, city.lng, EARTH_RADIUS)
      targetRef.current = target.clone().normalize().multiplyScalar(4)
      startPosRef.current.copy(camera.position)
      startTimeRef.current = performance.now()
    }

    window.addEventListener('cameraTarget', handleCameraTarget)
    return () => window.removeEventListener('cameraTarget', handleCameraTarget)
  }, [camera])

  useFrame(() => {
    if (!targetRef.current) return

    const elapsed = performance.now() - startTimeRef.current
    const duration = 1200
    const t = Math.min(elapsed / duration, 1)
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    camera.position.lerpVectors(startPosRef.current, targetRef.current, eased)
    camera.lookAt(0, 0, 0)

    // Track camera position for share links
    ;(window as any).__cameraPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    }

    if (t >= 1) {
      targetRef.current = null
    }
  })

  return null
}

function KeyboardHandler() {
  const toggleLayer = useUIStore((s) => s.toggleLayer)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case 'r':
          ;(window as any).__resetCamera?.()
          break
        case 'f':
          e.preventDefault()
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
  }, [toggleLayer])

  return null
}

function App() {
  const token = useAuthStore((s) => s.token)
  const setShowLoginModal = useUIStore((s) => s.setShowLoginModal)

  return (
    <div className="app-container">
      <LoadingScreen />
      <Canvas
        camera={{ position: [...INITIAL_CAMERA_POS], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 3, 5]} intensity={1.8} />
        <Stars radius={300} depth={50} count={5000} factor={6} saturation={0} fade speed={1} />
        <Earth />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={12}
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.3}
        />
        <CameraController />
        <KeyboardHandler />
        <ScreenshotButton />
        <TimelineFlylines />
      </Canvas>
      <InfoCard />
      <LayerPanel />
      <SearchBar />
      <div className="top-bar">
        {token ? (
          <UserButton />
        ) : (
          <button className="login-btn" onClick={() => setShowLoginModal(true)}>
            登录 / 注册
          </button>
        )}
      </div>
      <AuthModal />
      <OnboardingGuide />
      <Dashboard />
      <CityComparison />
      <TimelineUI />
      <ShareLink />
    </div>
  )
}

export default App
