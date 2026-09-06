import { useState, useRef, useEffect, useCallback } from 'react'

function useDraggable(initial) {
  const [pos, setPos] = useState(initial)
  const dragging = useRef(false)
  const origin = useRef({})
  const onMouseDown = useCallback((e) => {
    if (['INPUT', 'BUTTON', 'TEXTAREA'].includes(e.target.tagName)) return
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, ex: pos.x, ey: pos.y }
    e.preventDefault()
  }, [pos])
  useEffect(() => {
    const onMove = (e) => { if (!dragging.current) return; setPos({ x: origin.current.ex + e.clientX - origin.current.mx, y: origin.current.ey + e.clientY - origin.current.my }) }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])
  return [pos, onMouseDown]
}

const LORE = `bred.txt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


        just a loaf of bred.




CA: xxxxxxxxxxxxxxxxxxxxxxxxx


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

export default function Notepad({ onClose, onFocus, focused }) {
  const [pos, onDragStart] = useDraggable({ x: 120, y: 80 })
  const [size, setSize] = useState({ w: 420, h: 320 })
  const resizing = useRef(false)
  const resizeOrigin = useRef({})

  const onResizeMouseDown = (e) => {
    e.stopPropagation(); e.preventDefault()
    resizing.current = true
    resizeOrigin.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h }
  }
  useEffect(() => {
    const onMove = (e) => { if (!resizing.current) return; setSize({ w: Math.max(280, resizeOrigin.current.w + e.clientX - resizeOrigin.current.mx), h: Math.max(180, resizeOrigin.current.h + e.clientY - resizeOrigin.current.my) }) }
    const onUp = () => { resizing.current = false }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return (
    <div
      onMouseDown={onFocus}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, width: size.w,
        fontFamily: '"Tahoma", sans-serif', fontSize: '12px',
        border: `2px solid ${focused ? '#0831d9' : '#888'}`,
        borderRadius: '6px 6px 4px 4px',
        boxShadow: focused ? '2px 2px 8px rgba(0,0,0,0.5)' : '1px 1px 4px rgba(0,0,0,0.3)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        zIndex: focused ? 400 : 350,
      }}
    >
      {/* Title */}
      <div onMouseDown={onDragStart} style={{
        background: focused
          ? 'linear-gradient(180deg, #0a246a 0%, #3a6ea5 8%, #0a246a 100%)'
          : 'linear-gradient(180deg, #7a8a9a 0%, #5a6a7a 100%)',
        padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'grab', userSelect: 'none', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '12px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }}>
          <span>📝</span> bred.txt — Notepad
        </div>
        <button onMouseDown={e => e.stopPropagation()} onClick={onClose} style={{ width: '20px', height: '18px', background: 'linear-gradient(180deg, #f88 0%, #c00 100%)', border: '1px solid #666', borderRadius: '2px', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>

      {/* Menu bar */}
      <div style={{ background: '#f0ece0', borderBottom: '1px solid #ccc', padding: '2px 6px', display: 'flex', gap: '12px', fontSize: '12px', flexShrink: 0 }}>
        {['File', 'Edit', 'Format', 'View', 'Help'].map(m => (
          <span key={m} style={{ cursor: 'default', padding: '1px 4px' }} onMouseEnter={e => e.target.style.background = '#316ac5'} onMouseLeave={e => e.target.style.background = 'transparent'}>{m}</span>
        ))}
      </div>

      {/* Text area */}
      <textarea
        readOnly
        defaultValue={LORE}
        onMouseDown={e => e.stopPropagation()}
        style={{
          flex: 1, height: size.h - 80, resize: 'none',
          border: 'none', outline: 'none',
          fontFamily: '"Courier New", monospace', fontSize: '12px',
          padding: '8px', background: '#fff', color: '#000',
          lineHeight: 1.5,
        }}
      />

      {/* Status + resize */}
      <div style={{ background: '#ece9d8', borderTop: '1px solid #ccc', padding: '2px 8px', fontSize: '11px', color: '#666', display: 'flex', justifyContent: 'space-between', position: 'relative', flexShrink: 0 }}>
        <span>Ln 1, Col 1</span>
        <span>100%</span>
        <div onMouseDown={onResizeMouseDown} style={{ position: 'absolute', right: 0, bottom: 0, width: '14px', height: '14px', cursor: 'nwse-resize', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '2px' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="6" y="6" width="2" height="2" fill="#999" /><rect x="3" y="6" width="2" height="2" fill="#999" /><rect x="6" y="3" width="2" height="2" fill="#999" /></svg>
        </div>
      </div>
    </div>
  )
}
