import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { cities } from '../../data/cities'
import { latLongToVector3 } from '../../utils/coords'

const EARTH_RADIUS = 2.005

const heatmapVertexShader = `
  attribute float intensity;
  varying float vIntensity;

  void main() {
    vIntensity = intensity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = intensity * 80.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const heatmapFragmentShader = `
  varying float vIntensity;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vIntensity;

    vec3 coldColor = vec3(0.0, 0.4, 1.0);
    vec3 warmColor = vec3(1.0, 0.3, 0.0);
    vec3 hotColor = vec3(1.0, 0.0, 0.1);

    vec3 color = mix(coldColor, warmColor, vIntensity);
    color = mix(color, hotColor, vIntensity * vIntensity);

    gl_FragColor = vec4(color, alpha * 0.6);
  }
`

export function Heatmap({ visible = true }: { visible?: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { positions, intensities } = useMemo(() => {
    const maxPopulation = Math.max(...cities.map((c) => c.population))
    const pos = new Float32Array(cities.length * 3)
    const intens = new Float32Array(cities.length)

    cities.forEach((city, i) => {
      const p = latLongToVector3(city.lat, city.lng, EARTH_RADIUS)
      pos[i * 3] = p.x
      pos[i * 3 + 1] = p.y
      pos[i * 3 + 2] = p.z
      intens[i] = city.population / maxPopulation
    })

    return { positions: pos, intensities: intens }
  }, [])

  if (!visible) return null

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-intensity"
          count={intensities.length}
          array={intensities}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={heatmapVertexShader}
        fragmentShader={heatmapFragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
