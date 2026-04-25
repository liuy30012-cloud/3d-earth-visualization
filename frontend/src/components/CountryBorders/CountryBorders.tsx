import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { latLongToVector3 } from '../../utils/coords'

const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector-geojson/master/geojson/ne_50m_admin_0_countries.geojson'

interface GeoJSONFeature {
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

function parseGeoJSONToLineSegments(
  features: GeoJSONFeature[],
  radius: number,
): Float32Array {
  const segments: number[] = []

  for (const feature of features) {
    const { type, coordinates } = feature.geometry
    if (type === 'Polygon') {
      const rings = coordinates as number[][][]
      for (const ring of rings) {
        for (let i = 0; i < ring.length - 1; i++) {
          const p1 = latLongToVector3(ring[i][1], ring[i][0], radius)
          const p2 = latLongToVector3(ring[i + 1][1], ring[i + 1][0], radius)
          segments.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
        }
      }
    } else if (type === 'MultiPolygon') {
      const polygons = coordinates as number[][][][]
      for (const polygon of polygons) {
        for (const ring of polygon) {
          for (let i = 0; i < ring.length - 1; i++) {
            const p1 = latLongToVector3(ring[i][1], ring[i][0], radius)
            const p2 = latLongToVector3(ring[i + 1][1], ring[i + 1][0], radius)
            segments.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
          }
        }
      }
    }
  }

  return new Float32Array(segments)
}

export function CountryBorders({ visible = true }: { visible?: boolean }) {
  const geometryRef = useRef<THREE.BufferGeometry>(null)
  const [positions, setPositions] = useState<Float32Array | null>(null)

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => {
        const coords = parseGeoJSONToLineSegments(data.features as GeoJSONFeature[], 2.01)
        setPositions(coords)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (geometryRef.current && positions) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3),
      )
    }
  }, [positions])

  if (!visible || !positions) return null

  return (
    <lineSegments>
      <bufferGeometry ref={geometryRef} />
      <lineBasicMaterial color={0x88ccff} transparent opacity={0.6} />
    </lineSegments>
  )
}
