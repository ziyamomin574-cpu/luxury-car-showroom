import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import * as THREE from 'three'
import type { Vec3 } from '@/data/cars'
import { usePageVisible } from '@/lib/prefs'
import { useShowroom } from '@/store/useShowroom'
import { Loader3D } from '@/components/Loader3D'
import { deviceTier, pixelRatioFor, QualityGuard, type QualityTier } from './useQualityTier'

class CanvasBoundary extends Component<
  { fallback: ReactNode; onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFail()
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

export type StageProps = {
  children: (ctx: { tier: QualityTier }) => ReactNode
  fallback: ReactNode
  camera?: { position: Vec3; fov?: number }
  className?: string
}

/**
 * Single shared WebGL surface. Handles no-WebGL devices, device-memory quality
 * tiers, tab-hidden pausing, load progress and hard failures.
 */
export function Stage({ children, fallback, camera, className }: StageProps) {
  const [tier, setTier] = useState<QualityTier>(deviceTier)
  const [failed, setFailed] = useState(false)
  const webglSupported = useShowroom((s) => s.webglSupported)
  const setWebglSupported = useShowroom((s) => s.setWebglSupported)
  const visible = usePageVisible()
  const { active, progress } = useProgress()

  useEffect(() => {
    setWebglSupported(Boolean(window.WebGL2RenderingContext))
  }, [setWebglSupported])

  if (!webglSupported || failed || tier === 0) return <>{fallback}</>

  return (
    <div className={`stage relative h-full w-full ${className ?? ''}`}>
      <CanvasBoundary fallback={fallback} onFail={() => setFailed(true)}>
        <Canvas
          dpr={pixelRatioFor(tier)}
          frameloop={visible ? 'always' : 'never'}
          camera={{
            position: camera?.position ?? [6.2, 2.3, 6.4],
            fov: camera?.fov ?? 35,
            near: 0.1,
            far: 120,
          }}
          gl={{
            antialias: tier === 2,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          onCreated={({ scene, gl }) => {
            scene.background = new THREE.Color('#000000')
            gl.toneMappingExposure = 1.05
          }}
        >
          <QualityGuard tier={tier} onTier={setTier} />
          <Suspense fallback={null}>{children({ tier })}</Suspense>
        </Canvas>
      </CanvasBoundary>
      {active && <Loader3D progress={progress} />}
    </div>
  )
}
