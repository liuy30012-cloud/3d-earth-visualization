import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const EARTH_RADIUS = 2.005

function getSunDirection(date: Date): THREE.Vector3 {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000)
  const declination =
    -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10)) * (Math.PI / 180)

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60
  const hourAngle = ((utcHours - 12) / 24) * 2 * Math.PI

  const sunLat = declination
  const sunLng = hourAngle

  return new THREE.Vector3(
    Math.cos(sunLat) * Math.cos(sunLng),
    Math.sin(sunLat),
    Math.cos(sunLat) * Math.sin(sunLng),
  ).normalize()
}

export function DayNightTerminator({ visible = true }: { visible?: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const sunDirRef = useRef(new THREE.Vector3(0, 0, 1))

  const uniforms = useMemo(
    () => ({
      uSunDirection: { value: new THREE.Vector3(0, 0, 1) },
      uOpacity: { value: 0 },
    }),
    [],
  )

  useFrame((_, delta) => {
    if (!visible) {
      uniforms.uOpacity.value = THREE.MathUtils.lerp(uniforms.uOpacity.value, 0, delta * 5)
      return
    }

    const sunDir = getSunDirection(new Date())
    sunDirRef.current.lerp(sunDir, 0.01)
    uniforms.uSunDirection.value.copy(sunDirRef.current)
    uniforms.uOpacity.value = THREE.MathUtils.lerp(uniforms.uOpacity.value, 1, delta * 5)
  })

  if (!visible && uniforms.uOpacity.value === 0) return null

  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;
          void main() {
            vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uSunDirection;
          uniform float uOpacity;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;

          void main() {
            float dotProduct = dot(normalize(vWorldNormal), uSunDirection);
            float nightFactor = smoothstep(-0.15, -0.05, -dotProduct);
            float dayFactor = smoothstep(0.05, 0.2, dotProduct);
            float twilight = 1.0 - nightFactor - dayFactor;

            vec3 nightColor = vec3(0.02, 0.02, 0.06);
            vec3 twilightColor = vec3(0.15, 0.08, 0.04);

            vec3 color = mix(nightColor, twilightColor, twilight / max(nightFactor + twilight + dayFactor, 0.001));
            float alpha = nightFactor * uOpacity * 0.7;

            gl_FragColor = vec4(color, alpha);
          }
        `}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}
