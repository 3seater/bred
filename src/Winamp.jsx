import { useState, useRef, useEffect, useCallback } from 'react'

function useDraggable(initial) {
  const [pos, setPos] = useState(initial)
  const dragging = useRef(false)
  const origin = useRef({})
  const onMouseDown = useCallback((e) => {
    if (['INPUT','BUTTON'].includes(e.target.tagName)) return
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

const PLAYLIST = [
  { title: 'bred theme', artist: '$bred', duration: '3:21' },
  { title: 'loaf life', artist: 'DogeLover99', duration: '2:47' },
  { title: 'daily bread (feat. shiba)', artist: 'bred_maxi', duration: '4:02' },
  { title: 'wen moon', artist: 'BreadBot2000', duration: '1:59' },
]

function VizBar({ active }) {
  const bars = 18
  return (
    <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '20px', padding: '0 2px' }}>
      {Array.from({ length: bars }, (_, i) => {
        const h = active ? Math.max(2, Math.random() * 20) : 2
        return (
          <div key={i} style={{
            width: '4px', height: `${h}px`,
            background: h > 14 ? '#00e87a' : h > 8 ? '#a0f040' : '#44a020',
            transition: active ? 'height 0.08s' : 'height 0.3s',
          }} />
        )
      })}
    </div>
  )
}

function Visualizer({ active }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setTick(n => n + 1), 80)
    return () => clearInterval(t)
  }, [active])
  return <VizBar active={active} key={tick} />
}

export default function Winamp({ onClose, onFocus, focused }) {
  const [pos, onDragStart] = useDraggable({ x: 20, y: window.innerHeight - 340 })
  const [playing, setPlaying] = useState(false)
  const [trackIdx, setTrackIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [vol, setVol] = useState(75)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const progressRef = useRef(null)
  const audioRef = useRef(null)

  // Progress animation (fake since no real audio)
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setPlaying(false); return 0 }
        return p + 0.2
      })
    }, 100)
    return () => clearInterval(t)
  }, [playing])

  const track = PLAYLIST[trackIdx]
  const elapsed = Math.floor((progress / 100) * 201) // fake seconds
  const fmt = s => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`

  const W = { bg: '#1a1a1a', green: '#00e87a', darkGreen: '#00a050', teal: '#008060', face: '#2a2a2a', text: '#00e87a', dim: '#006030' }

  return (
    <div onMouseDown={onFocus} style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: focused ? 400 : 350, userSelect: 'none' }}>
      {/* Main window */}
      <div style={{
        width: '275px', background: W.bg,
        border: `2px solid ${focused ? '#666' : '#333'}`,
        fontFamily: '"Courier New", monospace',
      }}>
        {/* Title bar */}
        <div onMouseDown={onDragStart} style={{
          background: focused ? 'linear-gradient(90deg, #1a6a3a, #0a3a1a)' : '#1a1a1a',
          padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'grab', borderBottom: '1px solid #333',
        }}>
          <span style={{ color: W.green, fontSize: '10px', letterSpacing: '0.15em', fontWeight: 'bold' }}>WINAMP 2.91</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            {['▬','▼','✕'].map((s, i) => (
              <button key={i} onMouseDown={e => e.stopPropagation()} onClick={i === 2 ? onClose : () => setShowPlaylist(v => !v)}
                style={{ width: '14px', height: '12px', background: '#333', border: '1px solid #555', color: W.green, fontSize: '8px', cursor: 'pointer', padding: 0 }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Visualizer + info */}
        <div style={{ background: '#000', padding: '4px 6px', borderBottom: '1px solid #222' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Visualizer active={playing} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: W.green, fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {trackIdx + 1}. {track.title}
              </div>
              <div style={{ color: W.dim, fontSize: '9px' }}>{track.artist}</div>
            </div>
          </div>
        </div>

        {/* Time + status */}
        <div style={{ background: '#000', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
          <span style={{ color: W.green, fontSize: '18px', fontFamily: '"Courier New", monospace', letterSpacing: '0.1em' }}>
            {fmt(elapsed)}
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: playing ? W.green : W.dim, fontSize: '9px' }}>▶ {playing ? 'PLAYING' : 'STOPPED'}</span>
            <span style={{ color: W.dim, fontSize: '9px' }}>128kbps 44kHz</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: '#000', padding: '4px 8px', borderBottom: '1px solid #222' }}>
          <div
            ref={progressRef}
            style={{ height: '8px', background: '#1a1a1a', border: '1px solid #333', cursor: 'pointer', position: 'relative' }}
            onClick={e => {
              const rect = progressRef.current.getBoundingClientRect()
              setProgress(((e.clientX - rect.left) / rect.width) * 100)
            }}
          >
            <div style={{ width: `${progress}%`, height: '100%', background: W.green }} />
          </div>
        </div>

        {/* Controls */}
        <div style={{ background: W.face, padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[
              { icon: '⏮', action: () => { setTrackIdx(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length); setProgress(0) } },
              { icon: '⏪', action: () => setProgress(p => Math.max(0, p - 5)) },
              { icon: playing ? '⏸' : '▶', action: () => setPlaying(v => !v) },
              { icon: '⏹', action: () => { setPlaying(false); setProgress(0) } },
              { icon: '⏩', action: () => setProgress(p => Math.min(100, p + 5)) },
              { icon: '⏭', action: () => { setTrackIdx(i => (i + 1) % PLAYLIST.length); setProgress(0) } },
            ].map((btn, i) => (
              <button key={i} onMouseDown={e => e.stopPropagation()} onClick={btn.action}
                style={{ width: '26px', height: '20px', background: '#333', border: '1px solid #555', color: W.green, fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: W.dim, fontSize: '9px' }}>VOL</span>
            <input type="range" min="0" max="100" value={vol}
              onChange={e => setVol(e.target.value)}
              onMouseDown={e => e.stopPropagation()}
              style={{ width: '50px', accentColor: W.green, height: '4px' }} />
          </div>
        </div>

        {/* Playlist toggle */}
        <div style={{ background: W.face, padding: '2px 8px', display: 'flex', gap: '4px' }}>
          {['EQ','PL','ML'].map((btn, i) => (
            <button key={btn} onMouseDown={e => e.stopPropagation()} onClick={() => i === 1 && setShowPlaylist(v => !v)}
              style={{ fontSize: '9px', background: i === 1 && showPlaylist ? W.teal : '#2a2a2a', border: '1px solid #444', color: W.green, cursor: 'pointer', padding: '1px 4px' }}>
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* Playlist window */}
      {showPlaylist && (
        <div style={{ width: '275px', background: '#000', border: '2px solid #333', borderTop: 'none', fontFamily: '"Courier New", monospace' }}>
          <div style={{ background: 'linear-gradient(90deg, #1a6a3a, #0a3a1a)', padding: '2px 8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: W.green, fontSize: '9px', letterSpacing: '0.1em' }}>PLAYLIST EDITOR</span>
            <span style={{ color: W.green, fontSize: '9px' }}>{PLAYLIST.length} tracks</span>
          </div>
          {PLAYLIST.map((t, i) => (
            <div
              key={i}
              onClick={() => { setTrackIdx(i); setProgress(0); setPlaying(true) }}
              style={{
                padding: '3px 8px', fontSize: '10px', cursor: 'pointer',
                background: i === trackIdx ? W.teal : 'transparent',
                color: i === trackIdx ? '#fff' : W.green,
                display: 'flex', justifyContent: 'space-between',
                borderBottom: '1px solid #111',
              }}
            >
              <span>{i + 1}. {t.title} — {t.artist}</span>
              <span style={{ color: W.dim }}>{t.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
