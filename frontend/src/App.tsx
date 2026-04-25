import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Earth } from './components/Earth/Earth'
import { CountryBorders } from './components/CountryBorders/CountryBorders'
import { CityMarkers } from './components/CityMarkers/CityMarkers'
import { Flylines } from './components/Flylines/Flylines'
import { Heatmap } from './components/Heatmap/Heatmap'
import { InfoCard } from './components/InfoCard/InfoCard'
import { LayerPanel } from './components/LayerPanel/LayerPanel'
import { AuthModal } from './components/AuthModal/AuthModal'
import { UserButton } from './components/UserButton/UserButton'
import { useUIStore } from './store/uiStore'
import { useAuthStore } from './store/authStore'
import './App.css'

function App() {
  const layers = useUIStore((s) => s.layers)
  const token = useAuthStore((s) => s.token)
  const nickname = useAuthStore((s) => s.nickname)
  const setShowLoginModal = useUIStore((s) => s.setShowLoginModal)

  return (
    <div className="app-container">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 3, 5]} intensity={1.8} />
        <Stars radius={300} depth={50} count={5000} factor={6} saturation={0} fade speed={1} />
        <Earth />
        <CountryBorders visible={layers.borders} />
        <CityMarkers visible={layers.markers} />
        <Flylines visible={layers.flylines} />
        <Heatmap visible={layers.heatmap} />
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
      </Canvas>
      <InfoCard />
      <LayerPanel />
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
    </div>
  )
}

export default App
