import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function Earth() {
  const earthRef = useRef<THREE.Group>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const { gl, camera } = useThree()

  // 使用公网 CDN 的 NASA 地球纹理
  const earthTexture = useTexture('https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg')
  const bumpTexture = useTexture('https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png')

  // 加载完成后设置各向异性过滤
  useEffect(() => {
    if (earthTexture) {
      earthTexture.anisotropy = gl.capabilities.getMaxAnisotropy()
    }
  }, [earthTexture, gl.capabilities])

  // 缓慢自转 + 同步大气层 Shader 相机位置
  useFrame((_state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.02
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
    <group ref={earthRef}>
      {/* 地球球体 */}
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 大气层光晕 - 自定义 Shader */}
      <mesh ref={atmosphereRef} scale={[1.03, 1.03, 1.03]}>
        <sphereGeometry args={[2, 64, 64]} />
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
