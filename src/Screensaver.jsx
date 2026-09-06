import { useEffect, useRef, useState } from 'react'

const IDLE_TIMEOUT = 30000 // 30 seconds

const SPRITES = ['🍞', '🐕', '🍞', '🐩', '🍞', '🥖', '🍞', '🐾']

function randomBetween(a, b) { return a + Math.random() * (b - a) }

function useIdleTimer(timeout) {
  const [idle, setIdle] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const reset = () => {
      setIdle(false)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setIdle(true), timeout)
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, reset))
    timer.current = setTimeout(() => setIdle(true), timeout)
    return () => {
      clearTimeout(timer.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [timeout])

  return idle
}

function Sprite({ emoji }) {
  const ref = useRef(null)
  const pos = useRef({
    x: randomBetween(40, window.innerWidth - 80),
    y: randomBetween(40, window.innerHeight - 120),
    vx: randomBetween(1, 2.5) * (Math.random() > 0.5 ? 1 : -1),
    vy: randomBetween(1, 2.5) * (Math.random() > 0.5 ? 1 : -1),
  })
  const animRef = useRef(null)

  useEffect(() => {
    const animate = () => {
      const p = pos.current
      p.x += p.vx
      p.y += p.vy
      const W = window.innerWidth - 70
      const H = window.innerHeight - 110
      if (p.x <= 0 || p.x >= W) p.vx *= -1
      if (p.y <= 0 || p.y >= H) p.vy *= -1
      p.x = Math.max(0, Math.min(W, p.x))
      p.y = Math.max(0, Math.min(H, p.y))
      if (ref.current) {
        ref.current.style.left = p.x + 'px'
        ref.current.style.top  = p.y + 'px'
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div ref={ref} style={{
      position: 'absolute', fontSize: '52px', lineHeight: 1,
      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
      userSelect: 'none', pointerEvents: 'none',
    }}>
      {emoji}
    </div>
  )
}

export default function Screensaver() {
  const idle = useIdleTimer(IDLE_TIMEOUT)

  if (!idle) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      zIndex: 9999, overflow: 'hidden', cursor: 'none',
    }}>
      {/* bred logo text */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'rgba(255,255,255,0.04)',
        fontSize: '20vw', fontFamily: '"Tahoma", sans-serif',
        fontWeight: 'bold', userSelect: 'none', pointerEvents: 'none',
        letterSpacing: '-0.02em',
      }}>bred</div>

      {/* Bouncing sprites */}
      {SPRITES.map((s, i) => <Sprite key={i} emoji={s} />)}

      {/* Dismiss hint */}
      <div style={{
        position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.3)', fontFamily: '"Tahoma", sans-serif',
        fontSize: '12px', letterSpacing: '0.1em',
      }}>
        move mouse to dismiss
      </div>
    </div>
  )
}
