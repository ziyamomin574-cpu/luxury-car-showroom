import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import type { QualityTier } from './useQualityTier'

/**
 * Studio lighting built entirely from lightformers, so no HDRI has to be
 * downloaded at runtime and the whole look stays inside the four-colour palette.
 */
export function StudioLights({ tier }: { tier: QualityTier }) {
  const shadows = tier === 2
  return (
    <>
      <Environment resolution={tier === 2 ? 256 : 128} frames={1}>
        <color attach="background" args={['#000000']} />
        <Lightformer
          form="rect"
          intensity={3.2}
          position={[0, 6, -8]}
          scale={[14, 3, 1]}
          color="#FFFFFF"
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-8, 2.5, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8, 3, 1]}
          color="#B8B8B8"
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[8, 2.5, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[8, 3, 1]}
          color="#F5F3EE"
        />
        <Lightformer form="ring" intensity={0.7} position={[0, 7, 0]} scale={6} color="#666666" />
      </Environment>

      <hemisphereLight args={['#B8B8B8', '#000000', 0.35]} />

      <spotLight
        position={[6.5, 9, 4.5]}
        angle={0.45}
        penumbra={0.85}
        intensity={140}
        distance={40}
        color="#FFFFFF"
        castShadow={shadows}
        shadow-mapSize={tier === 2 ? [2048, 2048] : [1024, 1024]}
        shadow-bias={-0.0004}
      />
      <spotLight
        position={[-7, 7, -5]}
        angle={0.5}
        penumbra={1}
        intensity={90}
        distance={36}
        color="#B8B8B8"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[0, 3, -6]} intensity={0.35} color="#666666" />
    </>
  )
}

export function ShowroomFloor({ tier }: { tier: QualityTier }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        {tier === 2 ? (
          <MeshReflectorMaterial
            resolution={512}
            mixBlur={1.1}
            mixStrength={26}
            blur={[320, 120]}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.35}
            mirror={0.45}
            color="#0A0A0A"
            metalness={0.62}
            roughness={0.88}
          />
        ) : (
          <meshStandardMaterial color="#1A1A1A" metalness={0.35} roughness={0.85} />
        )}
      </mesh>
      {tier > 0 && (
        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={0.62}
          scale={16}
          blur={2.6}
          far={4}
          resolution={tier === 2 ? 1024 : 512}
          color="#000000"
        />
      )}
    </group>
  )
}

export function Atmosphere() {
  return <fog attach="fog" args={['#000000', 14, 44]} />
}
