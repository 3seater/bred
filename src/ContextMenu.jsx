import { useEffect, useRef } from 'react'

const MENU_ITEMS = [
  { label: 'Arrange Icons By', sub: true },
  { label: 'Refresh', icon: '🔄' },
  { divider: true },
  { label: 'New Folder', icon: '📁' },
  { divider: true },
  { label: 'Buy $BRED 🍞', icon: '💰', action: 'buy', highlight: true },
  { divider: true },
  { label: 'Properties', icon: '⚙️' },
]

export default function ContextMenu({ x, y, onClose, onAction }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [onClose])

  // Clamp to viewport
  const menuW = 180
  const menuH = 240
  const cx = Math.min(x, window.innerWidth - menuW - 4)
  const cy = Math.min(y, window.innerHeight - menuH - 44)

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: cx, top: cy,
        width: menuW,
        background: '#ece9d8',
        border: '1px solid #848284',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
        fontFamily: '"Tahoma", sans-serif',
        fontSize: '12px',
        zIndex: 9000,
        padding: '2px 0',
      }}
    >
      {MENU_ITEMS.map((item, i) => {
        if (item.divider) return <div key={i} style={{ height: '1px', background: '#b0a890', margin: '2px 4px' }} />
        return (
          <div
            key={i}
            onClick={() => { if (item.action) onAction(item.action); onClose() }}
            style={{
              padding: '4px 20px 4px 28px',
              cursor: 'default',
              color: item.highlight ? '#0000cc' : '#000',
              fontWeight: item.highlight ? 'bold' : 'normal',
              display: 'flex', alignItems: 'center', gap: '6px',
              position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#316ac5'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = item.highlight ? '#0000cc' : '#000' }}
          >
            {item.icon && <span style={{ position: 'absolute', left: '6px', fontSize: '13px' }}>{item.icon}</span>}
            {item.label}
            {item.sub && <span style={{ marginLeft: 'auto', fontSize: '10px' }}>▶</span>}
          </div>
        )
      })}
    </div>
  )
}
