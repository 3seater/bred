import { useRef, useEffect, useMemo } from 'react'
import { useGLTF, Environment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Brushed metal material for shelf structure
const SHELF_METAL_NAMES = new Set(['steel', 'SKP_qingmo_4_6375725f_241f6759', 'SKP_qingmo_d_150d7482_241f6759'])

// Procedural scratch normal map — baked into a canvas texture at load time
function makeScatchNormalMap() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Base mid-grey (flat normal)
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, size, size)

  // Horizontal brushed scratches
  ctx.globalAlpha = 0.18
  for (let i = 0; i < 180; i++) {
    const y = Math.random() * size
    const alpha = 0.04 + Math.random() * 0.12
    const bright = Math.random() > 0.5
    ctx.strokeStyle = bright ? `rgba(160,160,255,${alpha})` : `rgba(60,60,200,${alpha})`
    ctx.lineWidth = Math.random() < 0.85 ? 1 : 2
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y + (Math.random() - 0.5) * 4)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}

// Preload both models
useGLTF.preload('/Store.glb')
useGLTF.preload('/Dog.glb')

function Store() {
  const { scene } = useGLTF('/Store.glb')

  useEffect(() => {
    const scratchNormal = makeScatchNormalMap()

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true

        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((mat) => {
          if (!mat) return

          if (SHELF_METAL_NAMES.has(mat.name)) {
            // Override to brushed steel
            mat.color.set('#6a6a6a')
            mat.metalness = 0.85
            mat.roughness = 0.38
            mat.normalMap = scratchNormal
            mat.normalScale = new THREE.Vector2(0.4, 0.4)
            mat.envMapIntensity = 1.2
            mat.needsUpdate = true
          } else {
            if (mat.map) {
              mat.map.anisotropy = 16
              mat.map.needsUpdate = true
            }
            mat.envMapIntensity = 0.7
            mat.needsUpdate = true
          }
        })
      }
    })
  }, [scene])

  return <primitive object={scene} position={[0, 0.02, 0]} />
}

function Dog() {
  const { scene } = useGLTF('/Dog.glb')
  const dogRef = useRef()
  const mouse = useRef({ x: 0, y: 0 })
  const targetQuat = useRef(new THREE.Quaternion())
  const currentQuat = useRef(new THREE.Quaternion())

  // Track normalised mouse position (-1 to 1)
  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((mat) => {
            if (mat.map) {
              mat.map.anisotropy = 16
              mat.map.needsUpdate = true
            }
            mat.envMapIntensity = 0.5
            mat.needsUpdate = true
          })
        }
      }
    })
  }, [scene])

  useFrame(() => {
    if (!dogRef.current) return

    const maxH = THREE.MathUtils.degToRad(22)
    const maxV = THREE.MathUtils.degToRad(3)

    const targetY = mouse.current.x * maxH
    const targetX = -mouse.current.y * maxV

    // 0.03 = heavier damping, slower lazy follow
    dogRef.current.rotation.y += (targetY - dogRef.current.rotation.y) * 0.03
    dogRef.current.rotation.x += (targetX - dogRef.current.rotation.x) * 0.03
  })

  // Dog world center from GLB: [-0.166, 0.979, 2.412]
  // We position the group there, then the primitive is offset back to origin
  return (
    <group
      ref={dogRef}
      position={[-0.166, 0.979 + 0.02, 2.412]}
    >
      <primitive object={scene} position={[0.166, -0.979 - 0.02, -2.412]} />
    </group>
  )
}

export default function Scene() {
  const shelfMetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#5a5a5a'),
    metalness: 0.82,
    roughness: 0.4,
  })

  return (
    <>
      {/* ── Back wall — same dark metal as shelves ── */}
      <mesh position={[-0.3, 1.5, -0.25]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <primitive object={shelfMetal} attach="material" />
      </mesh>

      {/* ── Floor ── */}
      <mesh position={[-0.3, -0.3, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* ── HDRI — low intensity, just for reflections ── */}
      <Environment
        preset="warehouse"
        background={false}
        environmentIntensity={0.15}
      />

      {/* ── Ambient — barely there, shadows stay dark ── */}
      <ambientLight intensity={0.04} color="#c0cce0" />

      {/* ══ SHELF STRIP LIGHTS — one per shelf row, pointing straight down ══ */}

      {/* Top shelf strip — Y≈1.55 items sit around Y≈1.35 */}
      <spotLight
        position={[-0.3, 1.82, 2.52]}
        target-position={[-0.3, 1.35, 2.52]}
        angle={0.55}
        penumbra={0.4}
        intensity={12}
        color="#fff8ee"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.002}
      />

      {/* Middle shelf strip — bread row at Y≈0.943 */}
      <spotLight
        position={[-0.3, 1.42, 2.52]}
        target-position={[-0.3, 0.94, 2.52]}
        angle={0.55}
        penumbra={0.4}
        intensity={14}
        color="#fff8ee"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.002}
      />

      {/* Bottom shelf strip — items at Y≈0.1 */}
      <spotLight
        position={[-0.3, 0.55, 2.52]}
        target-position={[-0.3, 0.05, 2.52]}
        angle={0.55}
        penumbra={0.4}
        intensity={10}
        color="#fff8ee"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.002}
      />

      {/* ══ SIDE KEY LIGHT — strong, from the right, casts hard shadows left ══ */}
      <directionalLight
        position={[3.5, 2.2, 3.0]}
        target-position={[-0.3, 0.9, 2.5]}
        intensity={3.5}
        color="#fff4e8"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />

      {/* ── Cool rim from behind — edge separation on shelf back ── */}
      <directionalLight
        position={[-0.3, 2.5, -1.5]}
        intensity={0.25}
        color="#a0b8d8"
      />

      {/* Models */}
      <Store />
      <Dog />
    </>
  )
}
