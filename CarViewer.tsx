import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import type { Car } from '@/data/cars'
import { usePrefersReducedMotion } from '@/lib/prefs'
import { useShowroom, type ViewMode } from '@/store/useShowroom'
import { FallbackImage } from '@/components/FallbackImage'
import { Atmosphere, ShowroomFloor, StudioLights } from './Studio'
import { Stage } from './Stage'
import { CameraRig } from './CameraRig'
import { CarModel } from './CarModel'
import { ProceduralCar } from './ProceduralCar'
import type { QualityTier } from './useQualityTier'

function usePaintHex(car: Car): string {
  const colors = useShowroom((s) => s.colors)
  const id = colors[car.slug] ?? car.colors[0].id
  return car.colors.find((c) => c.id === id)?.hex ?? car.colors[0].hex
}

function CarScene({
  car,
  paintHex,
  tier,
  mode,
  autoRotate,
  resetToken,
  zoomRequest,
  onZoomApplied,
  direction,
  reducedMotion,
}: {
  car: Car
  paintHex: string
  tier: QualityTier
  mode: ViewMode
  autoRotate: boolean
  resetToken: number
  zoomRequest: { factor: number; token: number }
  onZoomApplied?: () => void
  direction: number
  reducedMotion: boolean
}) {
  const rootRef = useRef<THREE.Group>(null)
  const { active } = useProgress()

  useEffect(() => {
    const node = rootRef.current
    if (!node || reducedMotion || direction === 0) return
    const tween = gsap.fromTo(
      node.position,
      { x: direction * 3.2, y: 0.1 },
      { x: 0, y: 0, duration: 0.85, ease: 'power3.out' },
    )
    return () => {
      tween.kill()
    }
  }, [car.slug, direction, reducedMotion])

  const span = Math.max(car.shape.length, 4.5)

  return (
    <>
      <Atmosphere />
      <StudioLights tier={tier} />
      <ShowroomFloor tier={tier} />
      <group ref={rootRef}>
        {!active && (
          <group>
            {car.model.kind === 'glb' && car.model.glb ? (
              <CarModel car={car} paintHex={paintHex} reducedMotion={reducedMotion} />
            ) : (
              <ProceduralCar
                shape={car.shape}
                seats={car.specs.seats}
                paintHex={paintHex}
                interior={mode === 'interior'}
                reducedMotion={reducedMotion}
              />
            )}
          </group>
        )}
      </group>
      <CameraRig
        exterior={car.model.exteriorCam}
        interior={car.model.interiorCam}
        mode={mode}
        autoRotate={autoRotate}
        reducedMotion={reducedMotion}
        resetToken={resetToken}
        zoomRequest={zoomRequest}
        minDistance={span * 0.55}
        maxDistance={span * 2.1}
        onZoomApplied={onZoomApplied}
      />
    </>
  )
}

export type CarViewerProps = {
  car: Car
  /** Direction of the last car-to-car transition, for the cinematic slide. */
  direction?: number
}

/**
 * Canvas host for a single car. State that the UI also needs (view mode,
 * fullscreen, zoom) lives in the Zustand store; camera moves are imperative.
 */
export function CarViewer({ car, direction = 0 }: CarViewerProps) {
  const reducedMotion = usePrefersReducedMotion()
  const viewMode = useShowroom((s) => s.viewMode)
  const autoRotate = useShowroom((s) => s.autoRotate)
  const resetToken = useShowroom((s) => s.resetToken)
  const zoomRequest = useShowroom((s) => s.zoomRequest)
  const paintHex = usePaintHex(car)

  useEffect(() => {
    const { colors, setColor, setViewMode } = useShowroom.getState()
    setViewMode('exterior')
    if (!colors[car.slug]) setColor(car.slug, car.colors[0].id)
  }, [car.slug, car.colors])

  return (
    <Stage
      className="rounded-glass"
      camera={{ position: car.model.exteriorCam.position, fov: 35 }}
      fallback={<FallbackImage car={car} className="h-full" />}
    >
      {({ tier }) => (
        <CarScene
          car={car}
          paintHex={paintHex}
          tier={tier}
          mode={viewMode}
          autoRotate={autoRotate}
          resetToken={resetToken}
          zoomRequest={zoomRequest}
          onZoomApplied={() => useShowroom.getState().setAutoRotate(false)}
          direction={direction}
          reducedMotion={reducedMotion}
        />
      )}
    </Stage>
  )
}
