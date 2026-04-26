import * as THREE from 'three'

export function latLongToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const latRad = lat * (Math.PI / 180)
  const lngRad = lng * (Math.PI / 180)

  // Standard spherical → Cartesian for a sphere at identity rotation.
  // The outer <group> applies a shared -π/2 Y rotation to both the mesh and
  // all overlays, so this formula stays standard: lng=0 at +X axis.
  return new THREE.Vector3(
    radius * Math.cos(latRad) * Math.cos(lngRad),
    radius * Math.sin(latRad),
    radius * Math.cos(latRad) * Math.sin(lngRad),
  )
}
