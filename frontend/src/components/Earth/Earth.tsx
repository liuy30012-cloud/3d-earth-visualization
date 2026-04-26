import { useRef, useEffect } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { CountryBorders } from '../CountryBorders/CountryBorders'
import { CityMarkers } from '../CityMarkers/CityMarkers'
import { Flylines } from '../Flylines/Flylines'
import { Heatmap } from '../Heatmap/Heatmap'
import { BarChart } from '../BarChart/BarChart'
import { DayNightTerminator } from '../DayNightTerminator/DayNightTerminator'
import { useUIStore } from '../../store/uiStore'

const EARTH_RADIUS = 2

const THEMES: Record<string, { earth: string; bump: string }> = {
  satellite: { earth: '/earth-blue-marble.jpg', bump: '/earth-topology.png' },
  dark: { earth: '/earth-night.jpg', bump: '/earth-topology.png' },
  terrain: { earth: '/earth-topology.png', bump: '/earth-topology.png' },
}

export function Earth() {
  const earthGroupRef = useRef<THREE.Group>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const { gl, camera } = useThree()
  const layers = useUIStore((s) => s.layers)
  const setLoadingProgress = useUIStore((s) => s.setLoadingProgress)
  const setIsLoaded = useUIStore((s) => s.setIsLoaded)
  const earthTheme = useUIStore((s) => s.earthTheme)

  const theme = THEMES[earthTheme] ?? THEMES.satellite

  const textures = useLoader(
    THREE.TextureLoader,
    [theme.earth, theme.bump],
    (xhr) => {
      if (xhr.total > 0) {
        setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100))
      }
    },
  )
  const earthTexture = textures[0]
  const bumpTexture = textures[1]

  useEffect(() => {
    if (earthTexture) {
      earthTexture.anisotropy = gl.capabilities.getMaxAnisotropy()
      if (earthTheme === 'dark') {
        earthTexture.colorSpace = THREE.SRGBColorSpace
      }
    }
    setLoadingProgress(100)
    setTimeout(() => setIsLoaded(true), 400)
  }, [earthTexture, bumpTexture, gl.capabilities, setLoadingProgress, setIsLoaded, earthTheme])

  useFrame(() => {
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += 0.0003
    }
    if (atmosphereRef.current?.material && 'uniforms' in atmosphereRef.current.material) {
      const mat = atmosphereRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uCameraPosition.value.copy(camera.position)
    }
  })

  useEffect(() => {
    const canvas = gl.domElement as HTMLCanvasElement
    canvas.style.cursor = 'grab'
    return () => {
      canvas.style.cursor = 'default'
    }
  }, [gl])

  return (
    <group ref={earthGroupRef}>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
          <meshStandardMaterial
            map={earthTexture}
            bumpMap={bumpTexture || undefined}
            bumpScale={0.05}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        <CountryBorders visible={layers.borders} />
        <CityMarkers visible={layers.markers} />
        <Flylines visible={layers.flylines} />
        <Heatmap visible={layers.heatmap} />
        <BarChart visible={layers.barchart} />
        <DayNightTerminator visible={layers.dayNight} />
      </group>

      <mesh ref={atmosphereRef} scale={[1.03, 1.03, 1.03]}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <shaderMaterial
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            uniform vec3 uCameraPosition;

            void main() {
              vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
              float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
              float intensity = pow(rim, 3.0) * 1.2;
              vec3 color = mix(vec3(0.3, 0.6, 1.0), vec3(0.1, 0.4, 0.9), rim);
              gl_FragColor = vec4(color, intensity * 0.8);
            }
          `}
          uniforms={{
            uCameraPosition: { value: new THREE.Vector3(0, 0, 6) },
          }}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
