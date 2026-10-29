import { useEffect, useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { cars, type Car } from '@/data/cars'
import { usePrefersReducedMotion } from '@/lib/prefs'
import { useShowroom } from '@/store/useShowroom'
import { Atmosphere, ShowroomFloor, StudioLights } from './Studio'
import { Stage } from './Stage'
import { ProceduralCar } from './ProceduralCar'
import type { QualityTier } from './useQualityTier'

const ARC_RADIUS = 9.5
const ARC_START = Math.PI * 0.62
const ARC_STEP = Math.PI * 0.18

const BAYS = cars.map((car, i) => {
  const angle = ARC_START + i * ARC_STEP
  return {
    car,
    angle,
    position: [Math.cos(angle) * ARC_RADIUS, 0, Math.sin(angle) * ARC_RADIUS] as [number, number, number],
    rotation: -angle + Math.PI / 2,
  }
})

function usePaintHex(car: Car): string {
  const colors = useShowroom((s) => s.colors)
  const id = colors[car.slug] ?? car.colors[0].id
  return car.colors.find((c) => c.id === id)?.hex ?? car.colors[0].hex
}

function Bay({
  car,
  position,
  rotation,
  tier,
  index,
  active,
  reducedMotion,
  onSelect,
}: {
  car: Car
  position: [number, number, number]
  rotation: number
  tier: QualityTier
  index: number
  active: boolean
  reducedMotion: boolean
  onSelect: (car: Car) => void
}) {
  const paintHex = usePaintHex(car)
  const pedTop = 0.28
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, pedTop / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.05, 2.2, pedTop, 48]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.5} roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, pedTop + 0.002, 0]}>
        <ringGeometry args={[1.55, 1.95, 64]} />
        <meshBasicMaterial color={active ? '#FFFFFF' : '#666666'} transparent opacity={active ? 0.5 : 0.25} />
      </mesh>
      <group
        position={[0, pedTop, 0]}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(car)
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = ''
        }}
      >
        <ProceduralCar
          shape={car.shape}
          seats={car.specs.seats}
          paintHex={paintHex}
          interior={false}
          reducedMotion={reducedMotion}
          animateIn={!reducedMotion}
          delay={reducedMotion ? 0 : index * 0.12}
        />
        {tier > 0 && (
          <spotLight
            position={[0, 6.2, 0.4]}
            angle={0.32}
            penumbra={1}
            intensity={active ? 220 : 120}
            distance={16}
            color="#F5F3EE"
            castShadow={tier === 2}
          />
        )}
      </group>
      <Html position={[0, 1.05, -2.2]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="glass px-4 py-2 text-center whitespace-nowrap">
          <p className="label">{car.brand}</p>
          <p className="font-display text-lg leading-tight">{car.name}</p>
        </div>
      </Html>
    </group>
  )
}

function ShowroomCamera({
  focus,
  reducedMotion,
  onArrive,
}: {
  focus: Car | null
  reducedMotion: boolean
  onArrive: (car: Car) => void
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const drift = useRef(0)
  const desired = useRef(new THREE.Vector3(0, 7.5, 15))
  const look = useRef(new THREE.Vector3(0, 0.6, 0))
  const tween = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (!focus) {
      tween.current?.kill()
      return
    }
    const bay = BAYS.find((b) => b.car.slug === focus.slug)
    if (!bay) return
    const out = new THREE.Vector3(bay.position[0] * 1.42, 2.5, bay.position[2] * 1.42)
    const inLook = new THREE.Vector3(bay.position[0], 0.6, bay.position[2])
    desired.current.copy(out)
    look.current.copy(inLook)
    if (reducedMotion) {
      onArrive(focus)
      return
    }
    tween.current?.kill()
    tween.current = gsap.fromTo(
      camera.position,
      { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      {
        x: out.x,
        y: out.y,
        z: out.z,
        duration: 1.15,
        ease: 'power3.inOut',
        onUpdate: () => look.current.copy(inLook),
        onComplete: () => onArrive(focus),
      },
    )
  }, [camera, focus, onArrive, reducedMotion])

  useFrame((_, delta) => {
    if (focus) {
      camera.position.copy(desired.current)
      camera.lookAt(look.current)
      return
    }
    drift.current += delta * 0.045
    const r = 15.5
    desired.current.set(Math.sin(drift.current) * r * 0.55, 6.4 + Math.sin(drift.current * 0.7) * 0.6, Math.cos(drift.current) * r)
    camera.position.lerp(desired.current, reducedMotion ? 1 : Math.min(1, delta * 1.4))
    camera.lookAt(look.current)
  })

  return null
}

function ShowroomInner({
  tier,
  onSelect,
  focus,
  onArrive,
  reducedMotion,
}: {
  tier: QualityTier
  onSelect: (car: Car) => void
  focus: Car | null
  onArrive: (car: Car) => void
  reducedMotion: boolean
}) {
  return (
    <>
      <Atmosphere />
      <StudioLights tier={tier} />
      <ShowroomFloor tier={tier} />
      {tier > 0 &&
        [-8, -4, 0, 4, 8].map((z) => (
          <mesh key={z} position={[0, 5.6, z]} rotation={[0, 0, 0]}>
            <boxGeometry args={[22, 0.06, 0.16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}
      {BAYS.map((bay, i) => (
        <Bay
          key={bay.car.slug}
          car={bay.car}
          position={bay.position}
          rotation={bay.rotation}
          tier={tier}
          index={i}
          active={focus?.slug === bay.car.slug}
          reducedMotion={reducedMotion}
          onSelect={onSelect}
        />
      ))}
      <ShowroomCamera focus={focus} reducedMotion={reducedMotion} onArrive={onArrive} />
    </>
  )
}

export function ShowroomScene({ onEnter }: { onEnter: (slug: string) => void }) {
  const reducedMotion = usePrefersReducedMotion()
  const [focus, setFocus] = useState<Car | null>(null)
  const colors = useShowroom((s) => s.colors)

  useEffect(() => {
    cars.forEach((car) => {
      const { setColor } = useShowroom.getState()
      if (!colors[car.slug]) setColor(car.slug, car.colors[0].id)
    })
  }, [colors])

  const fallback = useMemo(
    () => (
      <div className="grid grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <a
            key={car.slug}
            href={`/cars/${car.slug}`}
            className="glass flex flex-col gap-1 p-4 transition-colors hover:border-muted"
          >
            <span className="label">{car.brand}</span>
            <span className="font-display text-xl">{car.name}</span>
            <span className="text-xs text-detail">{car.type}</span>
          </a>
        ))}
      </div>
    ),
    [],
  )

  return (
    <Stage
      className="rounded-glass"
      camera={{ position: [0, 6.4, 15.5], fov: 42 }}
      fallback={fallback}
    >
      {({ tier }) => (
        <ShowroomInner
          tier={tier}
          focus={focus}
          reducedMotion={reducedMotion}
          onSelect={(car) => setFocus(car)}
          onArrive={(car) => onEnter(car.slug)}
        />
      )}
    </Stage>
  )
}
