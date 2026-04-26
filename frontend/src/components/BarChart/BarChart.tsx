import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { cities } from '../../data/cities'
import { latLongToVector3 } from '../../utils/coords'

const EARTH_RADIUS = 2
const MAX_BAR_HEIGHT = 1.2
const MAX_POPULATION = Math.max(...cities.map((c) => c.population))

function CityBar({ city, height, index }: { city: typeof cities[number]; height: number; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const basePos = latLongToVector3(city.lat, city.lng, EARTH_RADIUS)
  const dir = basePos.clone().normalize()
  const barCenter = basePos.clone().add(dir.clone().multiplyScalar(height / 2))

  return (
    <group position={basePos} lookAt={dir.clone().multiplyScalar(2)}>
      <mesh ref={meshRef} position={[0, 0, height / 2]}>
        <cylinderGeometry args={[0.015, 0.02, height, 8]} />
        <meshStandardMaterial
          color={new THREE.Color().setHSL(0.05 + (height / MAX_BAR_HEIGHT) * 0.25, 0.9, 0.55)}
          emissive={new THREE.Color().setHSL(0.05 + (height / MAX_BAR_HEIGHT) * 0.25, 0.8, 0.3)}
          emissiveIntensity={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  )
}

export function BarChart({ visible = true }: { visible?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const targetScale = visible ? 1 : 0
  const currentScaleRef = useRef(visible ? 1 : 0)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const t = Math.min(delta * 4, 1)
    currentScaleRef.current = THREE.MathUtils.lerp(currentScaleRef.current, targetScale, t)
    groupRef.current.scale.setScalar(currentScaleRef.current)
  })

  const bars = useMemo(
    () =>
      cities.map((city, i) => {
        const height = (city.population / MAX_POPULATION) * MAX_BAR_HEIGHT
        return <CityBar key={city.name + city.country} city={city} height={height} index={i} />
      }),
    [],
  )

  return (
    <group ref={groupRef} scale={currentScaleRef.current}>
      {bars}
    </group>
  )
}
