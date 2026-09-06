import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress, Html } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import * as THREE from 'three'
import Scene from './Scene.jsx'
import UI from './UI.jsx'

// Exact camera from Store (3).glb — no rotation on camera node, clean straight position
const CAM_POSITION = [-0.177, 1.024, 4.154]
const CAM_QUAT = new THREE.Quaternion(0, 0, 0, 1) // no rotation — camera looks straight down -Z
const CAM_FOV = 24

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{
        color: '#e8d5b0',
        fontFamily: '"Helvetica Neue", sans-serif',
        fontSize: '13px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        opacity: 0.7,
      }}>
        {Math.round(progress)}%
      </div>
    </Html>
  )
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#CDF904' }}>
      <Canvas
        shadows="soft"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          shadowMapType: THREE.PCFSoftShadowMap,
        }}
        style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
        camera={{
          fov: CAM_FOV,
          near: 0.001,
          far: 1000,
          position: CAM_POSITION,
        }}
        onClick={() => { window.dispatchEvent(new Event('desktop:deselect')) }}
        onCreated={({ camera }) => {
          camera.quaternion.copy(CAM_QUAT)
          camera.updateMatrixWorld()
        }}
      >
        <Suspense fallback={<Loader />}>
          <Scene />
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.82}
              luminanceSmoothing={0.3}
              intensity={0.5}
              mipmapBlur
            />
            {/* Film grain — subtle, blended so it doesn't overpower */}
            <Noise
              premultiply
              blendFunction={BlendFunction.OVERLAY}
              opacity={0.6}
            />
            {/* Slight chromatic aberration at edges — film/lens feel */}
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new Vector2(0.0008, 0.0008)}
              radialModulation={true}
              modulationOffset={0.4}
            />
            <Vignette eskil={false} offset={0.16} darkness={0.68} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <div style={{ position: 'relative', zIndex: 100 }}>
        <UI />
      </div>
    </div >
  )
}
