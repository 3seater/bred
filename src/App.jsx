import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ToneMapping, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import * as THREE from 'three'
import Scene from './Scene.jsx'
import UI from './UI.jsx'
import XPLogin from './XPLogin.jsx'

const CAM_POSITION = [-0.177, 1.024, 4.154]
const CAM_QUAT = new THREE.Quaternion(0, 0, 0, 1)
const CAM_FOV = 24

// Run after the composer: downloads alone don't mean textures and shaders are ready.
function ProgressWatcher({ onReady }) {
  const frames = useRef(0)
  useFrame(() => {
    if (++frames.current === 3) onReady()
  }, 2)
  return null
}

export default function App() {
  const [sceneReady, setSceneReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [desktopVisible, setDesktopVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  function handleLogin() {
    setLoggedIn(true)
  }

  function handleLogout() {
    setDesktopVisible(false)
    setTimeout(() => setLoggedIn(false), 400)
  }

  useEffect(() => {
    if (loggedIn && sceneReady) {
      const timer = setTimeout(() => setDesktopVisible(true), 400)
      return () => clearTimeout(timer)
    }
  }, [loggedIn, sceneReady])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>

      {/* 3D canvas — always mounted so GLBs load in background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#CDF904',
        opacity: desktopVisible ? 1 : 0,
        transition: 'opacity 0.35s ease',
        pointerEvents: desktopVisible ? 'all' : 'none',
      }}>
        <Canvas
          dpr={[1, 1.5]}
          frameloop={pageVisible && (!sceneReady || desktopVisible) ? 'always' : 'demand'}
          shadows="soft"
          gl={{
            antialias: false,
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
          <Suspense fallback={null}>
            <ProgressWatcher onReady={() => setSceneReady(true)} />
            <Scene />
            <EffectComposer multisampling={2}>
              <Bloom
                luminanceThreshold={0.82}
                luminanceSmoothing={0.3}
                intensity={0.5}
                mipmapBlur
              />
              <Noise
                premultiply
                blendFunction={BlendFunction.OVERLAY}
                opacity={0.6}
              />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new Vector2(0.0008, 0.0008)}
                radialModulation={true}
                modulationOffset={0.4}
              />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          </Suspense>
        </Canvas>

        <div style={{ position: 'relative', zIndex: 100 }}>
          {loggedIn && <UI onLogout={handleLogout} />}
        </div>
      </div>

      {/* XP Login — shown until user clicks their name */}
      {!desktopVisible && <XPLogin onLogin={handleLogin} onLogout={handleLogout} sceneReady={sceneReady} />}
    </div>
  )
}
