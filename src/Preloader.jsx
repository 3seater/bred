import { useState, useEffect, useRef } from 'react'

// Marching progress bar segments — classic XP boot loader
function XPProgressBar() {
  const [active, setActive] = useState(0)
  const SEGMENTS = 3
  const TOTAL = 20

  useEffect(() => {
    const t = setInterval(() => {
      setActive(n => (n + 1) % TOTAL)
    }, 80)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      display: 'flex',
      gap: '2px',
      padding: '2px',
      border: '1px solid #444',
      background: '#000',
      width: '160px',
      height: '14px',
      alignItems: 'center',
    }}>
      {Array.from({ length: TOTAL }, (_, i) => {
        const lit = (i >= active && i < active + SEGMENTS) ||
          (active + SEGMENTS > TOTAL && i < (active + SEGMENTS) % TOTAL)
        return (
          <div key={i} style={{
            flex: 1,
            height: '100%',
            background: lit ? '#3a85d0' : '#0a0a14',
            borderRadius: '1px',
          }} />
        )
      })}
    </div>
  )
}

export default function Preloader({ ready }) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setFading(true), 400)
    return () => clearTimeout(t)
  }, [ready])

  useEffect(() => {
    if (!fading) return
    const t = setTimeout(() => setVisible(false), 700)
    return () => clearTimeout(t)
  }, [fading])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '28px',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.7s ease',
      pointerEvents: fading ? 'none' : 'all',
      fontFamily: '"Tahoma", sans-serif',
    }}>

      {/* XP-style logo block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        {/* Pixelated "bred" wordmark — rendered as pixel squares like XP logo */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
          <span style={{
            fontSize: '38px',
            fontFamily: '"Tahoma", sans-serif',
            fontWeight: 'bold',
            color: '#fff',
            letterSpacing: '-1px',
            imageRendering: 'pixelated',
            textShadow: '2px 2px 0 #1a5cb8, -1px -1px 0 #0a3a8a',
          }}>bred</span>
          {/* XP-style colored flag dots */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
            {['#e8403a', '#3aae3a', '#1a6ae8', '#e8c03a'].map((c, i) => (
              <div key={i} style={{
                width: '8px', height: '8px',
                background: c,
                imageRendering: 'pixelated',
                opacity: 0.9,
              }} />
            ))}
          </div>
        </div>

        <div style={{
          color: '#8ab4d8',
          fontSize: '11px',
          letterSpacing: '0.08em',
          fontFamily: '"Tahoma", sans-serif',
        }}>
          Professional Edition
        </div>
      </div>

      {/* Marching progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <XPProgressBar />
        <div style={{
          color: '#888',
          fontSize: '10px',
          fontFamily: '"Tahoma", sans-serif',
          letterSpacing: '0.04em',
        }}>
          Loading daily bread...
        </div>
      </div>

      {/* Bottom copyright like real XP */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        color: '#555',
        fontSize: '10px',
        fontFamily: '"Tahoma", sans-serif',
        letterSpacing: '0.04em',
      }}>
        © bred. All loaves reserved.
      </div>
    </div>
  )
}
