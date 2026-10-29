import { useEffect, useMemo, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import type { Vec3 } from '@/data/cars'

type Vec = { x: number; y: number; z: number }

type ControlsLike = {
  target: THREE.Vector3
  update: () => void
  enabled: boolean
}

function toVec(v: Vec3): Vec {
  return { x: v[0], y: v[1], z: v[2] }
}

export type CameraRigProps = {
  exterior: { position: Vec3; target: Vec3 }
  interior: Vec3
  mode: 'exterior' | 'interior'
  autoRotate: boolean
  reducedMotion: boolean
  /** Bump to fly back to the default exterior framing. */
  resetToken: number
  /** Positive/negative multiplier applied by the zoom buttons. */
  zoomRequest: { factor: number; token: number }
  minDistance: number
  maxDistance: number
  onZoomApplied?: () => void
}

/**
 * Owns the camera: orbits on the outside, flies to the driver's seat on the
 * inside, and hands GSAP-tweened position/target proxies to every UI action.
 */
export function CameraRig({
  exterior,
  interior,
  mode,
  autoRotate,
  reducedMotion,
  resetToken,
  zoomRequest,
  minDistance,
  maxDistance,
  onZoomApplied,
}: CameraRigProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const controls = useThree((s) => s.controls) as ControlsLike | null

  const posProxy = useMemo(() => toVec(exterior.position), [exterior])
  const lookProxy = useMemo(() => toVec(exterior.target), [exterior])
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const running = useRef(false)

  const sync = () => {
    camera.position.set(posProxy.x, posProxy.y, posProxy.z)
    if (controls) controls.target.set(lookProxy.x, lookProxy.y, lookProxy.z)
  }

  const apply = (position: Vec, target: Vec, duration: number) => {
    timeline.current?.kill()
    const fromPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    const fromLook = controls
      ? { x: controls.target.x, y: controls.target.y, z: controls.target.z }
      : { x: lookProxy.x, y: lookProxy.y, z: lookProxy.z }

    if (duration <= 0 || reducedMotion) {
      Object.assign(posProxy, position)
      Object.assign(lookProxy, target)
      sync()
      if (controls) controls.update()
      running.current = false
      return
    }

    Object.assign(posProxy, fromPos)
    Object.assign(lookProxy, fromLook)
    running.current = true
    timeline.current = gsap
      .timeline({ onComplete: () => (running.current = false) })
      .to(posProxy, { ...position, duration, ease: 'power3.inOut' }, 0)
      .to(lookProxy, { ...target, duration, ease: 'power3.inOut' }, 0)
  }

  useEffect(() => {
    const fov = mode === 'interior' ? 70 : 35
    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [camera, mode])

  useEffect(() => {
    if (mode === 'interior') {
      const eye = interior
      apply(
        toVec(eye),
        { x: eye[0] + 5, y: eye[1] - 0.45, z: eye[2] * 0.5 },
        1.15,
      )
    } else {
      apply(toVec(exterior.position), toVec(exterior.target), 0.9)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, exterior, interior, reducedMotion])

  useEffect(() => {
    if (mode !== 'exterior') return
    apply(toVec(exterior.position), toVec(exterior.target), 0.7)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken])

  useEffect(() => {
    if (mode !== 'exterior' || !controls) return
    const target = controls.target
    const dir = camera.position.clone().sub(target)
    const current = dir.length()
    if (!Number.isFinite(current) || current <= 0) return
    const next = THREE.MathUtils.clamp(current * zoomRequest.factor, minDistance, maxDistance)
    if (Math.abs(next - current) < 0.01) return
    dir.normalize().multiplyScalar(next)
    apply(
      { x: target.x + dir.x, y: target.y + dir.y, z: target.z + dir.z },
      { x: target.x, y: target.y, z: target.z },
      0.45,
    )
    onZoomApplied?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomRequest.token])

  useFrame(() => {
    if (running.current) sync()
    controls?.update()
  })

  return (
    <OrbitControls
      makeDefault
      enabled={mode === 'exterior'}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.85}
      zoomSpeed={0.7}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={0.28}
      maxPolarAngle={Math.PI / 2 - 0.03}
      autoRotate={mode === 'exterior' && autoRotate && !reducedMotion}
      autoRotateSpeed={0.55}
    />
  )
}
