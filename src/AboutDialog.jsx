import { useState, useRef, useEffect, useCallback } from 'react'

function useDraggable(initial) {
  const [pos, setPos] = useState(initial)
  const dragging = useRef(false)
  const origin = useRef({})
  const onMouseDown = useCallback((e) => {
    if (['BUTTON'].includes(e.target.tagName)) return
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

const TABS = ['General', 'Tokenomics', 'Team', 'Legal']

const TAB_CONTENT = {
  General: (
    <div style={{ padding: '12px', fontFamily: '"Tahoma", sans-serif', fontSize: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '48px' }}>🍞</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>$BRED</div>
          <div style={{ color: '#444' }}>Daily Bread Token</div>
          <div style={{ color: '#888', fontSize: '11px' }}>Version 1.0.0 (launch edition)</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <Row label="Chain" value="Solana" />
        <Row label="Symbol" value="$BRED" />
        <Row label="Status" value="🟢 Live" />
        <Row label="Website" value="bred.lol" />
        <Row label="Dog" value="Present and watching" />
      </div>
    </div>
  ),
  Tokenomics: (
    <div style={{ padding: '12px', fontFamily: '"Tahoma", sans-serif', fontSize: '12px' }}>
      <Row label="Total Supply" value="1,000,000,000" />
      <Row label="Circulating" value="1,000,000,000" />
      <Row label="Burnt" value="0% (bread doesn't burn)" />
      <Row label="Tax" value="0% buy / 0% sell" />
      <Row label="LP" value="Locked forever" />
      <Row label="Dev wallet" value="0%" />
      <Row label="Marketing" value="vibes only" />
      <div style={{ marginTop: '12px', padding: '8px', background: '#fffbe6', border: '1px solid #e0c840', fontSize: '11px' }}>
        ⚠️ This is a memecoin. Do your own research. Not financial advice. Only buy bread you can afford to lose.
      </div>
    </div>
  ),
  Team: (
    <div style={{ padding: '12px', fontFamily: '"Tahoma", sans-serif', fontSize: '12px' }}>
      {[
        { name: 'BreadBot2000',    role: 'Founder & Head Baker' },
        { name: 'xX_ToastKing_Xx', role: 'Chief Loaf Officer' },
        { name: 'freshloafz',      role: 'VP of Shelf Management' },
        { name: 'bred_maxi',       role: 'Lead Dog Wrangler' },
        { name: 'DogeLover99',     role: 'Community Manager' },
      ].map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontSize: '20px' }}>👤</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>{m.name}</div>
            <div style={{ color: '#666', fontSize: '11px' }}>{m.role}</div>
          </div>
        </div>
      ))}
    </div>
  ),
  Legal: (
    <div style={{ padding: '12px', fontFamily: '"Tahoma", sans-serif', fontSize: '11px', color: '#444', lineHeight: 1.6 }}>
      <p>$BRED is a community memecoin with no intrinsic value or expectation of financial return.</p>
      <p style={{ marginTop: '8px' }}>The dog on the shelf is not a licensed financial advisor. The bread loaves are not securities. Any resemblance to actual financial products is purely coincidental and frankly alarming.</p>
      <p style={{ marginTop: '8px' }}>By visiting this website you agree that bread is delicious and the dog is watching.</p>
      <p style={{ marginTop: '8px' }}>© bred. All loaves reserved. Do not refrigerate.</p>
    </div>
  ),
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', padding: '3px 0', borderBottom: '1px solid #eee', fontSize: '12px', fontFamily: '"Tahoma", sans-serif' }}>
      <span style={{ width: '110px', color: '#666', flexShrink: 0 }}>{label}:</span>
      <span style={{ fontWeight: '500' }}>{value}</span>
    </div>
  )
}

export default function AboutDialog({ onClose, onFocus, focused }) {
  const [pos, onDragStart] = useDraggable({
    x: window.innerWidth / 2 - 220,
    y: window.innerHeight / 2 - 200,
  })
  const [tab, setTab] = useState('General')

  return (
    <div
      onMouseDown={onFocus}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        width: 440,
        fontFamily: '"Tahoma", sans-serif', fontSize: '12px',
        border: `2px solid ${focused ? '#0831d9' : '#888'}`,
        borderRadius: '6px 6px 4px 4px',
        boxShadow: focused ? '2px 2px 10px rgba(0,0,0,0.5)' : '1px 1px 4px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        zIndex: focused ? 400 : 350,
        background: '#ece9d8',
      }}
    >
      {/* Title */}
      <div onMouseDown={onDragStart} style={{
        background: focused
          ? 'linear-gradient(180deg, #0a246a 0%, #3a6ea5 8%, #0a246a 100%)'
          : 'linear-gradient(180deg, #7a8a9a 0%, #5a6a7a 100%)',
        padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'grab', userSelect: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '12px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }}>
          <span>🍞</span> $BRED Properties
        </div>
        <button onMouseDown={e => e.stopPropagation()} onClick={onClose}
          style={{ width: '20px', height: '18px', background: 'linear-gradient(180deg, #f88 0%, #c00 100%)', border: '1px solid #666', borderRadius: '2px', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #999', padding: '4px 4px 0', gap: '2px', background: '#d4d0c8' }}>
        {TABS.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: '4px 14px',
            background: tab === t ? '#ece9d8' : '#c4c0b8',
            border: '1px solid #999',
            borderBottom: tab === t ? '1px solid #ece9d8' : '1px solid #999',
            borderRadius: '3px 3px 0 0',
            cursor: 'default',
            fontSize: '12px',
            marginBottom: tab === t ? '-1px' : '0',
            fontWeight: tab === t ? 'bold' : 'normal',
            color: '#000',
          }}>{t}</div>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: '#ece9d8', minHeight: '200px' }}>
        {TAB_CONTENT[tab]}
      </div>

      {/* Footer buttons */}
      <div style={{ background: '#d4d0c8', borderTop: '1px solid #999', padding: '6px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
        {['OK', 'Cancel', 'Apply'].map(btn => (
          <button key={btn} onMouseDown={e => e.stopPropagation()} onClick={onClose}
            style={{
              padding: '3px 20px', fontSize: '12px', fontFamily: 'inherit',
              background: 'linear-gradient(180deg, #f8f8f8 0%, #d8d0c8 100%)',
              border: '1px solid #999', borderRadius: '2px',
              cursor: 'pointer', boxShadow: 'inset 1px 1px 0 #fff',
            }}>{btn}</button>
        ))}
      </div>
    </div>
  )
}
