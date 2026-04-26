import { useState, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { cities } from '../../data/cities'
import { useUIStore } from '../../store/uiStore'
import { latLongToVector3 } from '../../utils/coords'
import { applyFilter } from '../../utils/filter'

function CityMarker({
  city,
  onClick,
  scale = 1,
}: {
  city: typeof cities[number]
  onClick: () => void
  scale?: number
}) {
  const [hovered, setHovered] = useState(false)
  const position = latLongToVector3(city.lat, city.lng, 2.05)
  const dir = position.clone().normalize()

  return (
    <group position={position} lookAt={dir.clone().multiplyScalar(2)} scale={scale}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
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
  const setSelectedCity = useUIStore((s) => s.setSelectedCity)
  const filter = useUIStore((s) => s.filter)
  const flylineMode = useUIStore((s) => s.flylineMode)
  const customFlylineStart = useUIStore((s) => s.customFlylineStart)
  const setCustomFlylineStart = useUIStore((s) => s.setCustomFlylineStart)
  const customFlylineEnd = useUIStore((s) => s.customFlylineEnd)
  const setCustomFlylineEnd = useUIStore((s) => s.setCustomFlylineEnd)
  const { camera } = useThree()
  const distRef = useRef(camera.position.length())

  useFrame(() => {
    distRef.current = camera.position.length()
  })

  if (!visible) return null

  const filteredCities = useMemo(() => cities.filter(applyFilter(filter)), [filter])

  const sortedByPopulation = useMemo(
    () => [...filteredCities].sort((a, b) => b.population - a.population),
    [filteredCities],
  )

  const visibleCities = useMemo(() => {
    const dist = distRef.current
    if (dist > 8) return sortedByPopulation.slice(0, 10)
    if (dist > 5) return sortedByPopulation.slice(0, 20)
    return sortedByPopulation
  }, [sortedByPopulation])

  const handleCityClick = (city: typeof cities[number]) => {
    if (flylineMode) {
      if (!customFlylineStart) {
        setCustomFlylineStart(city)
      } else if (!customFlylineEnd) {
        setCustomFlylineEnd(city)
      }
    } else {
      setSelectedCity(city)
    }
  }

  return (
    <group>
      {visibleCities.map((city) => (
        <CityMarker
          key={city.name + city.country}
          city={city}
          onClick={() => handleCityClick(city)}
        />
      ))}
    </group>
  )
}
