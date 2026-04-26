import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { cities } from '../../data/cities'
import { latLongToVector3 } from '../../utils/coords'
import { useUIStore } from '../../store/uiStore'

const EARTH_RADIUS = 2

function createArcPoints(start: THREE.Vector3, end: THREE.Vector3, segments = 50): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const mid = start.clone().add(end).multiplyScalar(0.5)
  const dist = start.distanceTo(end)
  mid.normalize().multiplyScalar(EARTH_RADIUS + dist * 0.3)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const p = new THREE.Vector3().lerpVectors(start, end, t)
    const arc = new THREE.Vector3().lerpVectors(
      new THREE.Vector3().lerpVectors(start, mid, t),
      new THREE.Vector3().lerpVectors(mid, end, t),
      t,
    )
    p.lerp(arc, Math.sin(t * Math.PI))
    points.push(p)
  }
  return points
}

const flylineMaterialVertexShader = `
  attribute float lineDistance;
  varying float vDistance;
  uniform float uTime;
  uniform float uTotalLength;

  void main() {
    vDistance = lineDistance / uTotalLength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const flylineMaterialFragmentShader = `
  varying float vDistance;
  uniform float uTime;
  uniform vec3 uColor;

  void main() {
    float flow = fract(vDistance * 3.0 - uTime * 0.8);
    float brightness = smoothstep(0.0, 0.15, flow) * smoothstep(0.5, 0.15, flow);
    float baseAlpha = 0.15;
    float alpha = baseAlpha + brightness * 0.85;
    vec3 color = mix(uColor * 0.3, uColor, brightness);
    gl_FragColor = vec4(color, alpha);
  }
`

interface FlylineData {
  positions: Float32Array
  distances: Float32Array
  totalLength: number
}

export function buildFlylineGeometry(
  start: THREE.Vector3,
  end: THREE.Vector3,
): FlylineData {
  const points = createArcPoints(start, end, 60)
  const positions = new Float32Array(points.length * 3)
  const distances = new Float32Array(points.length)
  let totalLength = 0

  for (let i = 0; i < points.length; i++) {
    positions[i * 3] = points[i].x
    positions[i * 3 + 1] = points[i].y
    positions[i * 3 + 2] = points[i].z
    if (i > 0) {
      totalLength += points[i].distanceTo(points[i - 1])
    }
    distances[i] = totalLength
  }

  return { positions, distances, totalLength }
}

export function Flyline({
  startCity,
  endCity,
  time,
  color,
}: {
  startCity: typeof cities[number]
  endCity: typeof cities[number]
  time: number
  color?: THREE.Color
}) {
  const meshRef = useRef<THREE.Line>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const flylineData = useMemo(() => {
    const start = latLongToVector3(startCity.lat, startCity.lng, EARTH_RADIUS)
    const end = latLongToVector3(endCity.lat, endCity.lng, EARTH_RADIUS)
    return buildFlylineGeometry(start, end)
  }, [startCity, endCity])

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time
    }
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(flylineData.positions, 3))
    geo.setAttribute('lineDistance', new THREE.BufferAttribute(flylineData.distances, 1))
    return geo
  }, [flylineData])

  return (
    <line ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={flylineMaterialVertexShader}
        fragmentShader={flylineMaterialFragmentShader}
        uniforms={{
          uTime: { value: time },
          uColor: { value: color ?? new THREE.Color(0x44aaff) },
          uTotalLength: { value: flylineData.totalLength },
        }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  )
}

// 预定义飞线连接（主要城市间的连接）
export const flylinePairs: [number, number][] = [
  [0, 1], [0, 2], [0, 3], // 北京到上海、广州、深圳
  [0, 5], [0, 6], // 北京到东京、首尔
  [0, 15], [0, 20], // 北京到纽约、伦敦
  [1, 10], [1, 11], // 上海到新加坡、雅加达
  [1, 15], // 上海到纽约
  [3, 14], // 深圳到墨尔本
  [5, 15], // 东京到纽约
  [15, 20], [15, 21], // 纽约到伦敦、巴黎
  [20, 22], // 伦敦到柏林
  [20, 24], // 伦敦到开罗
  [22, 23], // 柏林到迪拜
  [23, 32], // 迪拜到德黑兰
  [24, 34], // 开罗到内罗毕
  [26, 34], // 约翰内斯堡到内罗毕
  [27, 28], // 圣保罗到布宜诺斯艾利斯
  [27, 29], // 圣保罗到墨西哥城
  [29, 17], // 墨西哥城到芝加哥
  [29, 30], // 墨西哥城到多伦多
  [16, 17], // 洛杉矶到芝加哥
  [16, 18], // 洛杉矶到旧金山
  [10, 11], // 新加坡到雅加达
  [10, 9], // 新加坡到曼谷
  [6, 9], // 首尔到曼谷
  [7, 8], // 孟买到新德里
  [7, 23], // 孟买到迪拜
  [12, 11], // 马尼拉到雅加达
  [33, 32], // 利雅得到德黑兰
  [13, 14], // 悉尼到墨尔本
  [0, 19], // 北京到莫斯科
]

export function Flylines({ visible = true }: { visible?: boolean }) {
  const timeRef = useRef(0)
  const customStart = useUIStore((s) => s.customFlylineStart)
  const customEnd = useUIStore((s) => s.customFlylineEnd)
  const flylineMode = useUIStore((s) => s.flylineMode)

  useFrame((_state, delta) => {
    timeRef.current += delta
  })

  if (!visible) return null

  return (
    <group>
      {flylinePairs.map(([startIdx, endIdx], i) => (
        <Flyline
          key={`flyline-${i}`}
          startCity={cities[startIdx]}
          endCity={cities[endIdx]}
          time={timeRef.current + i * 0.1}
        />
      ))}
      {flylineMode && customStart && customEnd && (
        <Flyline
          key="custom-flyline"
          startCity={customStart}
          endCity={customEnd}
          time={timeRef.current}
          color={new THREE.Color(0xff8844)}
        />
      )}
    </group>
  )
}
