import { useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { cities } from '../../data/cities'
import { useUIStore } from '../../store/uiStore'
import { latLongToVector3 } from '../../utils/coords'

function CityMarker({
  city,
  onClick,
}: {
  city: typeof cities[number]
  onClick: () => void
}) {
  const { gl } = useThree()
  const [hovered, setHovered] = useState(false)
  const position = latLongToVector3(city.lat, city.lng, 2.05)

  // 仅标记朝向地球外的方向
  const dir = position.clone().normalize()

  return (
    <group position={position} lookAt={dir.clone().multiplyScalar(2)}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => {
          setHovered(true)
          gl.domElement.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          gl.domElement.style.cursor = 'grab'
        }}
      >
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? 0xff6644 : 0xff4422}
          emissive={hovered ? 0xff4422 : 0xff2200}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>
      {hovered && (
        <Text
          position={[0, 0.12, 0]}
          fontSize={0.08}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#000000"
        >
          {city.name}
        </Text>
      )}
    </group>
  )
}

export function CityMarkers({ visible = true }: { visible?: boolean }) {
  const selectedCity = useUIStore((s) => s.selectedCity)
  const setSelectedCity = useUIStore((s) => s.setSelectedCity)

  if (!visible) return null

  return (
    <group>
      {cities.map((city) => (
        <CityMarker
          key={city.name + city.country}
          city={city}
          onClick={() => setSelectedCity(city)}
        />
      ))}
    </group>
  )
}
