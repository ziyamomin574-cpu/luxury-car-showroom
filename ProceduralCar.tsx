import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import type { CarShape } from '@/data/cars'

type Metrics = ReturnType<typeof buildMetrics>

function buildMetrics(s: CarShape) {
  const L = s.length
  const W = s.width
  const H = s.height
  const bodyH = H * (s.cabin === 'suv' ? 0.52 : 0.4)
  const cabinH = Math.min(s.cabinHeight, Math.max(0.26, H - s.rideHeight - bodyH + 0.08))
  const cabinFrontX = L / 2 - s.cabinFront
  const cabinX = cabinFrontX - s.cabinLength / 2
  const cabinY = s.rideHeight + bodyH + cabinH / 2 - 0.05
  const noseY = s.rideHeight + bodyH * 0.3
  const noseH = bodyH * 0.62
  const wheelZ = W / 2 - s.wheelWidth / 2 - 0.03
  const axles: [number, number] = [-s.wheelbase / 2, s.wheelbase / 2]
  return {
    L,
    W,
    H,
    bodyH,
    cabinH,
    cabinLength: s.cabinLength,
    rideHeight: s.rideHeight,
    cabinX,
    cabinY,
    cabinFrontX,
    noseY,
    noseH,
    wheelZ,
    axles,
    bodyY: s.rideHeight + bodyH / 2,
  }
}

type Mats = ReturnType<typeof createMaterials>

function createMaterials() {
  return {
    paint: new THREE.MeshPhysicalMaterial({
      color: '#141414',
      metalness: 0.55,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.07,
      envMapIntensity: 1.1,
    }),
    trim: new THREE.MeshStandardMaterial({ color: '#15181a', metalness: 0.35, roughness: 0.62 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#0a0d10',
      metalness: 0.1,
      roughness: 0.06,
      transparent: true,
      opacity: 0.72,
      envMapIntensity: 1.6,
    }),
    tyre: new THREE.MeshStandardMaterial({ color: '#101214', roughness: 0.95, metalness: 0.05 }),
    rim: new THREE.MeshStandardMaterial({ color: '#c6c9cd', metalness: 0.95, roughness: 0.2 }),
    headlight: new THREE.MeshStandardMaterial({
      color: '#fff3d8',
      emissive: '#ffeec9',
      emissiveIntensity: 2.4,
    }),
    taillight: new THREE.MeshStandardMaterial({
      color: '#5c0d0a',
      emissive: '#ff2c1c',
      emissiveIntensity: 1.8,
    }),
    cabin: new THREE.MeshStandardMaterial({
      color: '#20242a',
      roughness: 0.85,
      metalness: 0.1,
      side: THREE.DoubleSide,
    }),
    leather: new THREE.MeshStandardMaterial({ color: '#2b2724', roughness: 0.9, metalness: 0.05 }),
    screen: new THREE.MeshStandardMaterial({
      color: '#0b0f14',
      emissive: '#4c6b8a',
      emissiveIntensity: 0.9,
      roughness: 0.3,
    }),
  }
}

function usePaintTween(material: THREE.MeshPhysicalMaterial, hex: string, reduced: boolean) {
  useLayoutEffect(() => {
    if (reduced) {
      material.color.set(hex)
      return
    }
    const target = new THREE.Color(hex)
    const tween = gsap.to(material.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration: 0.4,
      ease: 'power2.out',
    })
    return () => {
      tween.kill()
    }
  }, [hex, material, reduced])
}

function Wheel({
  x,
  z,
  radius,
  width,
  aero,
  mats,
}: {
  x: number
  z: number
  radius: number
  width: number
  aero: boolean
  mats: Mats
}) {
  return (
    <group position={[x, radius, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow material={mats.tyre}>
        <cylinderGeometry args={[radius, radius, width, 32, 1]} />
      </mesh>
      <mesh position={[0, width * 0.5 * (z > 0 ? 1 : -1), 0]} material={mats.rim}>
        <cylinderGeometry args={[radius * 0.64, radius * 0.64, width * 0.12, aero ? 20 : 12]} />
      </mesh>
      {aero && (
        <mesh position={[0, width * 0.55 * (z > 0 ? 1 : -1), 0]} material={mats.trim}>
          <cylinderGeometry args={[radius * 0.5, radius * 0.5, width * 0.1, 20]} />
        </mesh>
      )}
    </group>
  )
}

function Cabin({ m, mats, seats }: { m: Metrics; mats: Mats; seats: number }) {
  const seatZ = seats > 2 ? 0.36 : 0.3
  return (
    <group>
      <RoundedBox
        args={[m.cabinLength * 0.97, m.cabinH * 0.97, m.W * 0.86]}
        radius={0.07}
        smoothness={3}
        position={[m.cabinX, m.cabinY, 0]}
        material={mats.cabin}
      />
      {/* dashboard + centre display */}
      <RoundedBox
        args={[0.28, m.cabinH * 0.42, m.W * 0.74]}
        radius={0.05}
        smoothness={3}
        position={[m.cabinFrontX - m.cabinH * 0.28, m.cabinY - m.cabinH * 0.16, 0]}
        material={mats.trim}
      />
      <RoundedBox
        args={[0.05, m.cabinH * 0.26, m.W * 0.34]}
        radius={0.02}
        smoothness={2}
        position={[m.cabinFrontX - m.cabinH * 0.44, m.cabinY + m.cabinH * 0.02, 0.1]}
        material={mats.screen}
      />
      {[-1, 1].map((side) => (
        <group key={side} position={[m.cabinX + 0.1, m.cabinY - m.cabinH * 0.3, side * seatZ]}>
          <RoundedBox args={[0.5, 0.12, 0.46]} radius={0.05} smoothness={3} material={mats.leather} />
          <RoundedBox
            args={[0.14, 0.52, 0.46]}
            radius={0.05}
            smoothness={3}
            position={[-0.18, 0.3, 0]}
            rotation={[0, 0, 0.12]}
            material={mats.leather}
          />
        </group>
      ))}
      {seats > 2 && (
        <RoundedBox
          args={[0.42, 0.36, m.W * 0.6]}
          radius={0.05}
          smoothness={3}
          position={[m.cabinX - m.cabinLength * 0.34, m.cabinY - m.cabinH * 0.28, 0]}
          material={mats.leather}
        />
      )}
      <RoundedBox
        args={[m.cabinLength * 0.5, 0.16, 0.24]}
        radius={0.05}
        smoothness={3}
        position={[m.cabinX, m.cabinY - m.cabinH * 0.3, 0]}
        material={mats.trim}
      />
      <mesh position={[m.cabinFrontX - m.cabinH * 0.42, m.cabinY - m.cabinH * 0.1, seatZ]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.15, 0.024, 8, 24]} />
        <meshStandardMaterial color="#15171a" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Wing({ m, kind, mats }: { m: Metrics; kind: CarShape['wing']; mats: Mats }) {
  if (kind === 'none') return null
  const y = m.rideHeight + m.bodyH * 0.98
  const x = -m.L / 2 + m.L * 0.06
  if (kind === 'lip') {
    return (
      <RoundedBox
        args={[0.28, 0.07, m.W * 0.86]}
        radius={0.03}
        smoothness={3}
        position={[x, y, 0]}
        rotation={[0, 0, 0.18]}
        material={mats.paint}
      />
    )
  }
  return (
    <group position={[x, y, 0]}>
      <RoundedBox args={[0.36, 0.05, m.W * 0.92]} radius={0.025} smoothness={3} material={mats.trim} />
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.1, 0.24, 0.05]}
          radius={0.02}
          smoothness={2}
          position={[0.08, 0.13, side * m.W * 0.36]}
          material={mats.trim}
        />
      ))}
    </group>
  )
}

export type ProceduralCarProps = {
  shape: CarShape
  seats: number
  paintHex: string
  interior: boolean
  reducedMotion: boolean
  animateIn?: boolean
  /** Seconds since mount, used to stagger entrance animations in the showroom. */
  delay?: number
}

/**
 * Built-in stylised car used until a licensed GLB is dropped in at
 * `public/models/<slug>.glb`. The paint lives on its own material so the
 * colour changer works with or without a real model.
 */
export function ProceduralCar({
  shape,
  seats,
  paintHex,
  interior,
  reducedMotion,
  animateIn = true,
  delay = 0,
}: ProceduralCarProps) {
  const m = useMemo(() => buildMetrics(shape), [shape])
  const mats = useMemo(createMaterials, [])
  usePaintTween(mats.paint, paintHex, reducedMotion)

  useEffect(
    () => () => {
      Object.values(mats).forEach((material) => material.dispose())
    },
    [mats],
  )

  const group = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const node = group.current
    if (!node) return
    if (!animateIn || reducedMotion) {
      node.position.set(0, 0, 0)
      node.rotation.set(0, 0, 0)
      node.scale.setScalar(1)
      return
    }
    const tween = gsap.fromTo(
      node,
      { y: 0.9, rotationY: -0.55, scale: 0.9 },
      { y: 0, rotationY: 0, scale: 1, duration: 1.15, delay, ease: 'power3.out' },
    )
    return () => {
      tween.kill()
    }
  }, [animateIn, delay, reducedMotion, shape])

  const cabinLight = useRef<THREE.PointLight>(null)
  useFrame((_, delta) => {
    const light = cabinLight.current
    if (!light) return
    const target = interior ? 2.6 : 0
    light.intensity = THREE.MathUtils.damp(light.intensity, target, 5, delta)
  })

  return (
    <group ref={group} dispose={null}>
      {/* exterior shell — hidden in interior view so the cabin is reachable */}
      <group visible={!interior}>
        <RoundedBox
          args={[m.L, m.bodyH, m.W * 0.98]}
          radius={Math.min(0.16, m.bodyH * 0.35)}
          smoothness={4}
          position={[0, m.bodyY, 0]}
          castShadow
          receiveShadow
          material={mats.paint}
        />
        <RoundedBox
          args={[m.L * 0.2, m.noseH, m.W * 0.92]}
          radius={0.1}
          smoothness={3}
          position={[m.L / 2 - m.L * 0.1, m.noseY, 0]}
          castShadow
          material={mats.paint}
        />
        <RoundedBox
          args={[m.cabinLength, m.cabinH, m.W * 0.9]}
          radius={Math.min(0.2, m.cabinH * 0.4)}
          smoothness={4}
          position={[m.cabinX, m.cabinY, 0]}
          castShadow
          material={mats.glass}
        />
        <RoundedBox
          args={[m.cabinLength * 0.56, 0.09, m.W * 0.92]}
          radius={0.04}
          smoothness={3}
          position={[m.cabinX - m.cabinLength * 0.2, m.cabinY + m.cabinH / 2 - 0.08, 0]}
          castShadow
          material={mats.paint}
        />
        <Wing m={m} kind={shape.wing} mats={mats} />
        {/* lights, grille, mirrors, exhaust */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <RoundedBox
              args={[0.1, 0.11, 0.42]}
              radius={0.04}
              smoothness={3}
              position={[m.L / 2 - 0.04, m.noseY + m.noseH * 0.42, side * m.W * 0.26]}
              material={mats.headlight}
            />
            <RoundedBox
              args={[0.07, 0.1, 0.5]}
              radius={0.03}
              smoothness={3}
              position={[-m.L / 2 + 0.04, m.noseY + m.noseH * 0.45, side * m.W * 0.24]}
              material={mats.taillight}
            />
            <RoundedBox
              args={[0.16, 0.1, 0.16]}
              radius={0.04}
              smoothness={3}
              position={[m.cabinFrontX - 0.05, m.cabinY + m.cabinH * 0.1, side * (m.W * 0.5)]}
              material={mats.paint}
            />
            <mesh
              position={[-m.L / 2 + 0.06, m.noseY, side * m.W * 0.28]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.055, 0.06, 0.12, 16]} />
              <primitive object={mats.trim} attach="material" />
            </mesh>
          </group>
        ))}
        <RoundedBox
          args={[0.08, m.noseH * 0.6, m.W * 0.52]}
          radius={0.03}
          smoothness={3}
          position={[m.L / 2 - 0.02, m.noseY, 0]}
          material={mats.trim}
        />
      </group>

      <Cabin m={m} mats={mats} seats={seats} />
      <pointLight
        ref={cabinLight}
        position={[m.cabinX, m.cabinY + 0.1, 0]}
        color="#ffe6c4"
        intensity={0}
        distance={6}
        decay={2}
      />

      {m.axles.map((x) =>
        [-1, 1].map((side) => (
          <Wheel
            key={`${x}-${side}`}
            x={x}
            z={side * m.wheelZ}
            radius={shape.wheelRadius}
            width={shape.wheelWidth}
            aero={shape.wheels === 'aero'}
            mats={mats}
          />
        )),
      )}
    </group>
  )
}
