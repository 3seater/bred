import { useState, useEffect } from 'react'

const XP_TASKBAR = {
  bg: 'linear-gradient(180deg, #245edc 0%, #1a4db8 40%, #1a4db8 60%, #1e56cc 100%)',
  startBtn: 'linear-gradient(180deg, #5aad3f 0%, #3d8a28 50%, #2e6e1c 51%, #3d8a28 100%)',
  trayBg: 'rgba(0,0,80,0.3)',
  windowBtn: 'linear-gradient(180deg, #3a7ad8 0%, #2060c0 100%)',
  windowBtnActive: 'linear-gradient(180deg, #1a4db8 0%, #2468d8 100%)',
}

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = time.getHours().toString().padStart(2, '0')
  const m = time.getMinutes().toString().padStart(2, '0')
  return (
    <div style={{
      color: '#fff', fontSize: '11px', fontFamily: '"Tahoma", sans-serif',
      textAlign: 'center', lineHeight: 1.4, padding: '0 8px',
      textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
    }}>
      <div>{h}:{m}</div>
      <div style={{ fontSize: '10px', opacity: 0.85 }}>
        {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}

export default function Taskbar({ windows, onWindowClick, onStartClick, startOpen }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '38px',
      background: XP_TASKBAR.bg,
      borderTop: '1px solid #5080e8',
      display: 'flex', alignItems: 'center',
      zIndex: 500,
      userSelect: 'none',
      boxShadow: '0 -1px 0 rgba(255,255,255,0.2) inset',
    }}>
      {/* Start button */}
      <div
        onClick={onStartClick}
        style={{
          height: '34px', margin: '0 2px',
          background: startOpen
            ? 'linear-gradient(180deg, #2e6e1c 0%, #3d8a28 100%)'
            : XP_TASKBAR.startBtn,
          border: '1px solid rgba(0,0,0,0.4)',
          borderRadius: '0 12px 12px 0',
          padding: '0 14px 0 10px',
          display: 'flex', alignItems: 'center', gap: '6px',
          cursor: 'pointer',
          boxShadow: startOpen ? 'inset 0 2px 4px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.4)',
        }}
      >
        <span style={{ fontSize: '18px' }}>🍞</span>
        <span style={{
          color: '#fff', fontFamily: '"Tahoma", sans-serif', fontSize: '13px',
          fontWeight: 'bold', fontStyle: 'italic',
          textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
        }}>start</span>
      </div>

      {/* Separator */}
      <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

      {/* Window buttons */}
      <div style={{ flex: 1, display: 'flex', gap: '3px', padding: '0 4px', overflowX: 'auto' }}>
        {windows.map(w => (
          <button
            key={w.id}
            onClick={() => onWindowClick(w.id)}
            style={{
              height: '28px', minWidth: '120px', maxWidth: '180px',
              background: w.focused ? XP_TASKBAR.windowBtnActive : XP_TASKBAR.windowBtn,
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '3px',
              color: '#fff', fontSize: '11px', fontFamily: '"Tahoma", sans-serif',
              cursor: 'pointer', padding: '0 8px',
              display: 'flex', alignItems: 'center', gap: '5px',
              textAlign: 'left', overflow: 'hidden', whiteSpace: 'nowrap',
              boxShadow: w.focused ? 'inset 0 2px 3px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            <span>{w.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.title}</span>
          </button>
        ))}
      </div>

      {/* System tray */}
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center',
        background: XP_TASKBAR.trayBg,
        borderLeft: '1px solid rgba(255,255,255,0.15)',
        padding: '0 4px',
        gap: '4px',
      }}>
        <span style={{ fontSize: '14px', opacity: 0.8 }}>🔊</span>
        <span style={{ fontSize: '14px', opacity: 0.8 }}>🌐</span>
        <Clock />
      </div>
    </div>
  )
}
