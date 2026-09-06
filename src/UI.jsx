import { useState, useRef, useEffect, useCallback } from 'react'
import FileExplorer from './FileExplorer.jsx'
import Taskbar from './Taskbar.jsx'
import Notepad from './Notepad.jsx'
import ContextMenu from './ContextMenu.jsx'
import AboutDialog from './AboutDialog.jsx'
import { anonSignIn, registerPresence, sendMessage, subscribeMessages, subscribeUsers } from './firebase.js'

// ── Windows XP palette ──────────────────────────────────────────────
const XP = {
  titleBar: 'linear-gradient(180deg, #0a246a 0%, #3a6ea5 8%, #0a246a 100%)',
  windowBg: '#ece9d8',
  border: '#0831d9',
  borderLight: '#ffffff',
  borderShadow: '#848284',
  buttonBg: 'linear-gradient(180deg, #f8f8f8 0%, #d8d0c8 100%)',
  buttonBorder: '#7b7b7b',
  chatBg: '#ffffff',
  msgSelf: '#dff4ff',
  msgOther: '#ffffff',
}

function timestamp() {
  const n = new Date()
  return `${n.getHours().toString().padStart(2, '0')}:${n.getMinutes().toString().padStart(2, '0')}`
}

// ── Global deselect event ────────────────────────────────────────────
// Fired by the root UI when user clicks outside any icon/window
const DESELECT_EVENT = 'desktop:deselect'
function fireDeselect() { window.dispatchEvent(new Event(DESELECT_EVENT)) }

function useDesktopDeselect(setSelected) {
  useEffect(() => {
    const h = () => setSelected(false)
    window.addEventListener(DESELECT_EVENT, h)
    return () => window.removeEventListener(DESELECT_EVENT, h)
  }, [setSelected])
}

// ── Drag hook ───────────────────────────────────────────────────────
function useDraggable(initial) {
  const [pos, setPos] = useState(initial)
  const dragging = useRef(false)
  const origin = useRef({ mx: 0, my: 0, ex: 0, ey: 0 })

  const onMouseDown = useCallback((e) => {
    if (['INPUT', 'BUTTON', 'A'].includes(e.target.tagName)) return
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, ex: pos.x, ey: pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      setPos({
        x: origin.current.ex + (e.clientX - origin.current.mx),
        y: origin.current.ey + (e.clientY - origin.current.my),
      })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return [pos, onMouseDown]
}

// ── XP pixelated icon ───────────────────────────────────────────────
function XPIcon({ img, label, href, initialPos }) {
  const [pos, onDragStart] = useDraggable(initialPos)
  const [selected, setSelected] = useState(false)
  const [dragged, setDragged] = useState(false)
  const startPos = useRef(null)
  useDesktopDeselect(setSelected)

  const handleMouseDown = (e) => {
    startPos.current = { x: e.clientX, y: e.clientY }
    setDragged(false)
    onDragStart(e)
  }
  const handleMouseMove = (e) => {
    if (startPos.current) {
      const dx = Math.abs(e.clientX - startPos.current.x)
      const dy = Math.abs(e.clientY - startPos.current.y)
      if (dx > 3 || dy > 3) setDragged(true)
    }
  }
  const handleClick = (e) => {
    if (dragged) { e.preventDefault(); return }
    setSelected(true)
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => { startPos.current = null }}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        width: '90px',
        cursor: 'default',
        zIndex: 200,
        userSelect: 'none',
        textDecoration: 'none',
      }}
    >
      {/* Pixelated icon — rendered small then scaled up with pixelated rendering */}
      <div style={{
        width: '68px',
        height: '68px',
        position: 'relative',
        background: selected ? 'rgba(49,106,197,0.35)' : 'transparent',
        border: selected ? '1px dashed rgba(255,255,255,0.9)' : '1px solid transparent',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(2px 3px 3px rgba(0,0,0,0.7))',
      }}>
        <img
          src={img}
          alt={label}
          style={{
            width: '32px',
            height: '32px',
            imageRendering: 'pixelated',
            transform: 'scale(1.9)',
            transformOrigin: 'center',
            display: 'block',
            filter: 'saturate(1.3) contrast(1.1)',
          }}
        />
      </div>
      {/* XP label */}
      <span style={{
        color: '#fff',
        fontSize: '13px',
        fontFamily: '"Tahoma", sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
        background: selected ? 'rgba(49,106,197,0.7)' : 'transparent',
        padding: '1px 3px',
        lineHeight: 1.3,
        maxWidth: '90px',
        wordBreak: 'break-word',
      }}>
        {label}
      </span>
    </a>
  )
}

// ── XP window button ────────────────────────────────────────────────
function XPButton({ onClick, label, red }) {
  return (
    <button
      onClick={onClick}
      onMouseDown={e => e.stopPropagation()}
      style={{
        width: '20px', height: '18px',
        background: red
          ? 'linear-gradient(180deg, #f88 0%, #c00 100%)'
          : 'linear-gradient(180deg, #e8e8e8 0%, #b0b0b0 100%)',
        border: '1px solid #666',
        borderRadius: '2px',
        fontSize: '10px',
        color: red ? '#fff' : '#000',
        cursor: 'pointer',
        padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.6)',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}

// ── Random user color ────────────────────────────────────────────────
const USER_COLORS = [
  '#c0392b', '#8e44ad', '#2980b9', '#27ae60', '#d35400',
  '#16a085', '#2c3e50', '#7f8c8d', '#c0392b', '#1abc9c',
  '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#e67e22',
]
function randomUserColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
}

// ── Username prompt (XP dialog style) ───────────────────────────────
function UsernamePrompt({ onConfirm }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const confirm = () => {
    const t = name.trim()
    if (!t) return
    onConfirm(t)
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(236,233,216,0.97)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '12px', zIndex: 10, fontFamily: '"Tahoma", sans-serif',
    }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>Enter a username to join $bred chat</div>
      <input
        ref={inputRef}
        value={name}
        onChange={e => setName(e.target.value.slice(0, 20))}
        onKeyDown={e => e.key === 'Enter' && confirm()}
        placeholder="your name..."
        maxLength={20}
        onMouseDown={e => e.stopPropagation()}
        style={{
          border: '1px inset #999', background: '#fff',
          padding: '4px 8px', fontSize: '13px', fontFamily: 'inherit',
          outline: 'none', userSelect: 'text', width: '200px',
        }}
      />
      <button
        onClick={confirm}
        onMouseDown={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #f8f8f8 0%, #d8d0c8 100%)',
          border: '1px solid #999', padding: '4px 24px',
          fontSize: '13px', fontFamily: 'inherit',
          cursor: 'pointer', borderRadius: '2px', boxShadow: 'inset 1px 1px 0 #fff',
        }}
      >
        Join Chat
      </button>
    </div>
  )
}

// ── Chat window — draggable + resizable ─────────────────────────────
function ChatWindow({ onClose, onFocus, focused }) {
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [input, setInput] = useState('')
  const [minimized, setMinimized] = useState(false)
  const [size, setSize] = useState({ w: 360, h: 290 })
  const [user, setUser] = useState(null)
  const chatEndRef = useRef(null)
  const resizing = useRef(false)
  const resizeOrigin = useRef({})

  const [pos, onDragStart] = useDraggable({
    x: Math.max(0, window.innerWidth - 380),
    y: Math.max(0, window.innerHeight - 360),
  })

  // Subscribe to Firebase once user joins
  useEffect(() => {
    if (!user) return
    const unsubMsgs = subscribeMessages(setMessages)
    const unsubUsers = subscribeUsers(setOnlineUsers)
    return () => { unsubMsgs(); unsubUsers() }
  }, [user])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onResizeMouseDown = (e) => {
    e.stopPropagation(); e.preventDefault()
    resizing.current = true
    resizeOrigin.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h }
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!resizing.current) return
      setSize({
        w: Math.max(220, resizeOrigin.current.w + e.clientX - resizeOrigin.current.mx),
        h: Math.max(160, resizeOrigin.current.h + e.clientY - resizeOrigin.current.my),
      })
    }
    const onUp = () => { resizing.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  function handleJoin(name) {
    const color = randomUserColor()
    anonSignIn().then(uid => {
      registerPresence(uid, name, color)
      setUser({ uid, name, color })
    })
  }

  function send() {
    const t = input.trim()
    if (!t || !user) return
    sendMessage(user.uid, user.name, user.color, t)
    setInput('')
  }

  const chatAreaH = Math.max(60, size.h - 80)

  return (
    <div
      onMouseDown={onFocus}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, width: size.w,
        fontFamily: '"Tahoma", "MS Sans Serif", sans-serif', fontSize: '13px',
        boxShadow: `2px 2px 0 ${XP.borderShadow}, -1px -1px 0 ${XP.borderShadow}, inset 1px 1px 0 ${XP.borderLight}`,
        border: `2px solid ${focused === false ? '#888' : XP.border}`,
        borderRadius: '6px 6px 4px 4px',
        overflow: 'hidden', zIndex: 100,
        position: 'fixed',
      }}>
      {/* Title bar */}
      <div onMouseDown={onDragStart} style={{
        background: XP.titleBar, padding: '3px 6px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'grab', userSelect: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }}>
          $bred chat
          {user && <span style={{ fontWeight: 'normal', fontSize: '11px', opacity: 0.8 }}>— {user.name}</span>}
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <XPButton onClick={() => setMinimized(m => !m)} label={minimized ? '▲' : '▼'} />
          <XPButton label="✕" red onClick={onClose} />
        </div>
      </div>

      {!minimized && (
        <div style={{ position: 'relative' }}>
          {/* Username prompt overlay */}
          {!user && <UsernamePrompt onConfirm={handleJoin} />}

          {/* Online users strip — shows just current user for now, Firebase will populate */}
          <div style={{
            background: '#d4d0c8', borderBottom: '1px solid #999',
            padding: '3px 8px', display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px',
            minHeight: '24px',
          }}>
            {onlineUsers.length > 0
              ? onlineUsers.map((u, i) => <span key={i} style={{ color: u.color, fontWeight: 'bold' }}>• {u.username}</span>)
              : <span style={{ color: '#888', fontStyle: 'italic' }}>{user ? 'loading...' : 'no users online'}</span>
            }          </div>

          {/* Messages */}
          <div style={{
            background: XP.chatBg, height: chatAreaH, overflowY: 'auto',
            padding: '6px', borderBottom: '1px solid #999',
            display: 'flex', flexDirection: 'column', gap: '3px',
          }}>
            {messages.length === 0 && (
              <div style={{ color: '#aaa', fontSize: '12px', fontStyle: 'italic', padding: '8px 4px' }}>
                no messages yet. say something 🍞
              </div>
            )}
            {messages.map((m, i) => (
              <div key={m.id || i} style={{
                background: m.uid === user?.uid ? XP.msgSelf : XP.msgOther,
                padding: '2px 4px', borderRadius: '2px', lineHeight: 1.4, wordBreak: 'break-word',
              }}>
                <span style={{ color: m.color, fontWeight: 'bold' }}>{m.username}</span>
                <span style={{ color: '#888', fontSize: '11px', marginLeft: '4px' }}>
                  {m.ts ? new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
                <span style={{ color: '#000' }}>: {m.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ background: XP.windowBg, padding: '4px', display: 'flex', gap: '3px', position: 'relative' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              onMouseDown={e => e.stopPropagation()}
              disabled={!user}
              placeholder={user ? 'say something...' : 'join to chat...'}
              style={{
                flex: 1, border: '1px inset #999', background: '#fff',
                padding: '2px 4px', fontSize: '13px', fontFamily: 'inherit',
                outline: 'none', userSelect: 'text',
                opacity: user ? 1 : 0.5,
              }}
            />
            <button
              onClick={send}
              onMouseDown={e => e.stopPropagation()}
              disabled={!user}
              style={{
                background: XP.buttonBg, border: `1px solid ${XP.buttonBorder}`,
                padding: '2px 10px', fontSize: '13px', fontFamily: 'inherit',
                cursor: user ? 'pointer' : 'default', borderRadius: '2px',
                boxShadow: 'inset 1px 1px 0 #fff', opacity: user ? 1 : 0.5,
              }}
            >Send</button>
            <div onMouseDown={onResizeMouseDown} style={{ position: 'absolute', right: 0, bottom: 0, width: '14px', height: '14px', cursor: 'nwse-resize', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '2px' }}>
              <svg width="10" height="10" viewBox="0 0 10 10"><rect x="6" y="6" width="2" height="2" fill="#999" /><rect x="3" y="6" width="2" height="2" fill="#999" /><rect x="6" y="3" width="2" height="2" fill="#999" /></svg>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pixel art canvas icons ───────────────────────────────────────────
const ICON_SCALE = 4 // 16×16 grid → 64×64px

function PixelCanvas({ pixels, palette, size = 16 }) {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    ctx.imageSmoothingEnabled = false
    pixels.forEach((row, y) => {
      row.forEach((v, x) => {
        const color = palette[v]
        if (!color) return
        ctx.fillStyle = color
        ctx.fillRect(x * ICON_SCALE, y * ICON_SCALE, ICON_SCALE, ICON_SCALE)
      })
    })
  }, [])
  return <canvas ref={ref} width={size * ICON_SCALE} height={size * ICON_SCALE}
    style={{ imageRendering: 'pixelated', display: 'block' }} />
}

// XP-style yellow folder — 16×16
const FOLDER_PIXELS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0],
  [0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]
const FOLDER_PAL = { 0: null, 1: '#7a6010', 2: '#e0a820', 3: '#f8d060', 4: '#fff8c0' }

// XP-style notepad / text file — 16×16
const NOTEPAD_PIXELS = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0],
  [0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]
const NOTEPAD_PAL = { 0: null, 1: '#606060', 2: '#d0d0d0', 3: '#4080d0', 4: '#f8f8f8' }
function FolderIcon({ label, initialPos, onDoubleClick, type = 'folder' }) {
  const [pos, onDragStart] = useDraggable(initialPos)
  const [selected, setSelected] = useState(false)
  const [dragged, setDragged] = useState(false)
  const startPos = useRef(null)
  const clickTimer = useRef(null)
  useDesktopDeselect(setSelected)

  const handleMouseDown = (e) => {
    startPos.current = { x: e.clientX, y: e.clientY }
    setDragged(false)
    onDragStart(e)
  }
  const handleMouseMove = (e) => {
    if (startPos.current) {
      if (Math.abs(e.clientX - startPos.current.x) > 3 || Math.abs(e.clientY - startPos.current.y) > 3)
        setDragged(true)
    }
  }
  const handleClick = () => {
    if (dragged) return
    setSelected(true)
    // double-click detection
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      onDoubleClick()
    } else {
      clickTimer.current = setTimeout(() => { clickTimer.current = null }, 300)
    }
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => { startPos.current = null }}
      onClick={handleClick}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        width: '90px', cursor: 'default', zIndex: 200, userSelect: 'none',
      }}
    >
      <div style={{
        width: '68px', height: '68px',
        background: selected ? 'rgba(49,106,197,0.35)' : 'transparent',
        border: selected ? '1px dashed rgba(255,255,255,0.9)' : '1px solid transparent',
        borderRadius: '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.8))',
      }}>
        {type === 'folder'
          ? <PixelCanvas pixels={FOLDER_PIXELS} palette={FOLDER_PAL} />
          : <PixelCanvas pixels={NOTEPAD_PIXELS} palette={NOTEPAD_PAL} />
        }
      </div>
      <span style={{
        color: '#fff', fontSize: '13px', fontFamily: '"Tahoma", sans-serif', fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
        background: selected ? 'rgba(49,106,197,0.7)' : 'transparent',
        padding: '1px 3px',
      }}>
        {label}
      </span>
    </div>
  )
}

// ── Root UI ─────────────────────────────────────────────────────────
// ── Start Menu ───────────────────────────────────────────────────────
function StartMenu({ onOpen, onClose, onLogout }) {
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [onClose])

  const items = [
    { icon: '📝', label: 'bred.txt', action: 'notepad' },
    { icon: '📁', label: 'memes', action: 'explorer' },
    { icon: '💬', label: '$bred chat', action: 'chat' },
  ]

  return (
    <div ref={ref} style={{
      position: 'fixed', bottom: '38px', left: 0, width: '220px',
      background: '#ece9d8',
      border: '2px solid #0831d9',
      borderRadius: '8px 8px 0 0',
      boxShadow: '2px -2px 8px rgba(0,0,0,0.4)',
      zIndex: 9000,
      overflow: 'hidden',
      fontFamily: '"Tahoma", sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #1a5cb8 0%, #2468d8 100%)',
        padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ fontSize: '32px' }}>🍞</span>
        <div>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', textShadow: '1px 1px 1px #000' }}>bred user</div>
          <div style={{ color: '#cce4ff', fontSize: '11px' }}>daily bread holder</div>
        </div>
      </div>
      {/* Items */}
      <div style={{ padding: '4px 0' }}>
        {items.map(it => (
          <div key={it.action} onClick={() => { onOpen(it.action); onClose() }}
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'default', fontSize: '13px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#316ac5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{it.icon}</span>
            <span>{it.label}</span>
          </div>
        ))}
        <div style={{ height: '1px', background: '#b0a890', margin: '4px 8px' }} />
        <div style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'default', fontSize: '13px', color: '#c00' }}
          onClick={() => { onClose(); onLogout && onLogout() }}
          onMouseEnter={e => e.currentTarget.style.background = '#316ac5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>⏻</span>
          <span>Turn Off Computer</span>
        </div>
      </div>
    </div>
  )
}

// ── Root UI ─────────────────────────────────────────────────────────
export default function UI({ onLogout }) {
  const [explorerOpen, setExplorerOpen] = useState(false)
  const [notepadOpen, setNotepadOpen] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [contextMenu, setContextMenu] = useState(null)
  const [focused, setFocused] = useState('chat')

  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('[data-ui]')) return
      e.preventDefault()
      setContextMenu({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('contextmenu', handler)
    return () => window.removeEventListener('contextmenu', handler)
  }, [])

  const openWindow = (name) => {
    if (name === 'notepad') setNotepadOpen(true)
    if (name === 'explorer') setExplorerOpen(true)
    if (name === 'chat') setChatOpen(true)
    setFocused(name)
  }

  const handleContextAction = (action) => {
    if (action === 'buy') window.open('https://dexscreener.com', '_blank')
  }

  const handleTaskbarClick = (id) => {
    if (id === 'chat') { setChatOpen(true); setFocused('chat') }
    if (id === 'notepad') { setNotepadOpen(true); setFocused('notepad') }
    if (id === 'explorer') { setExplorerOpen(true); setFocused('explorer') }
  }

  const taskbarWindows = [
    chatOpen && { id: 'chat', icon: '💬', title: '$bred chat', focused: focused === 'chat' },
    notepadOpen && { id: 'notepad', icon: '📝', title: 'bred.txt', focused: focused === 'notepad' },
    explorerOpen && { id: 'explorer', icon: '📁', title: 'memes', focused: focused === 'explorer' },
    !chatOpen && { id: 'chat', icon: '💬', title: '$bred chat', focused: false },
  ].filter(Boolean)

  return (
    <div data-ui="true" onMouseDown={(e) => {
      // Deselect icons if clicking bare desktop (not on a window or icon)
      if (e.target === e.currentTarget) fireDeselect()
    }}>
      {/* Desktop icons — scattered, not grid-aligned */}
      <XPIcon href="https://www.ponsfamily.com/" img="/pons.png" label="Pons" initialPos={{ x: window.innerWidth - 118, y: 24 }} />
      <XPIcon href="https://dexscreener.com" img="/dex.jpg" label="DexScreener" initialPos={{ x: window.innerWidth - 210, y: 58 }} />
      <XPIcon href="https://twitter.com/bredonhood" img="/x.jpg" label="X / Twitter" initialPos={{ x: window.innerWidth - 126, y: 148 }} />
      <FolderIcon label="memes" initialPos={{ x: 18, y: window.innerHeight - 240 }} onDoubleClick={() => openWindow('explorer')} />
      <FolderIcon label="bred.txt" emoji="📝" initialPos={{ x: 110, y: window.innerHeight - 190 }} onDoubleClick={() => openWindow('notepad')} />

      {/* Windows */}
      {chatOpen && <ChatWindow onClose={() => setChatOpen(false)} onFocus={() => setFocused('chat')} focused={focused === 'chat'} />}
      {notepadOpen && <Notepad onClose={() => setNotepadOpen(false)} onFocus={() => setFocused('notepad')} focused={focused === 'notepad'} />}
      {explorerOpen && <FileExplorer onClose={() => setExplorerOpen(false)} />}

      {/* Taskbar */}
      <Taskbar
        windows={taskbarWindows}
        onWindowClick={handleTaskbarClick}
        onStartClick={() => setStartOpen(s => !s)}
        startOpen={startOpen}
      />
      {startOpen && <StartMenu onOpen={openWindow} onClose={() => setStartOpen(false)} onLogout={onLogout} />}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}

    </div>
  )
}
