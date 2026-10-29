import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import type { Car } from '@/data/cars'

/**
 * Loads a real GLB when one exists and applies the paint colour to the named
 * body material. Throws (and is caught by the canvas boundary) if the file is
 * missing or malformed, which drops the page back to the static fallback.
 */
export function CarModel({
  car,
  paintHex,
  reducedMotion,
}: {
  car: Car
  paintHex: string
  reducedMotion: boolean
}) {
  const gltf = useGLTF(car.model.glb as string) as unknown as {
    scene: THREE.Group
    materials: Record<string, THREE.Material>
  }

  const paints = useMemo(() => {
    const found: THREE.MeshPhysicalMaterial[] = []
    gltf.scene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return
      const material = (node as THREE.Mesh).material
      if (Array.isArray(material)) return
      if (material?.name === car.model.bodyMaterial) {
        const physical = material as THREE.MeshPhysicalMaterial
        physical.clearcoat = 1
        physical.clearcoatRoughness = 0.08
        physical.metalness = 0.55
        physical.roughness = 0.26
        found.push(physical)
      }
    })
    return found
  }, [car.model.bodyMaterial, gltf.scene])

  useEffect(() => {
    const target = new THREE.Color(paintHex)
    if (paints.length === 0) return
    if (reducedMotion) {
      paints.forEach((material) => material.color.set(paintHex))
      return
    }
    const tweens = paints.map((material) =>
      gsap.to(material.color, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: 0.4,
        ease: 'power2.out',
      }),
    )
    return () => {
      tweens.forEach((tween) => {
        tween.kill()
      })
    }
  }, [paints, paintHex, reducedMotion])

  const group = useRef<THREE.Group>(null)
  useEffect(() => {
    if (reducedMotion || !group.current) return
    const tween = gsap.fromTo(
      group.current,
      { y: 0.9, rotationY: -0.5, scale: 0.92 },
      { y: 0, rotationY: 0, scale: 1, duration: 1.1, ease: 'power3.out' },
    )
    return () => {
      tween.kill()
    }
  }, [reducedMotion, car.slug])

  return <primitive ref={group} object={gltf.scene} dispose={null} />
}
