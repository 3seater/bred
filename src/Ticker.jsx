import { useState, useEffect, useRef } from 'react'

const TICKER_ITEMS = [
  { label: '$BRED', value: null, change: '+420.69%' },
  { label: 'DAILY BREAD', value: '$2.29', change: null },
  { label: '$BRED ARMY', value: '🍞🍞🍞', change: null },
  { label: 'LOAVES SOLD', value: '1,000,000+', change: null },
  { label: 'DOG STATUS', value: 'WATCHING', change: null },
  { label: 'WHEAT INDEX', value: '+69%', change: '+69%' },
  { label: 'NGMI IF NO BRED', value: '⚠️', change: null },
  { label: 'WAGMI', value: '🍞✅', change: null },
]

export default function Ticker() {
  const [price, setPrice] = useState('---')
  const [scrollX, setScrollX] = useState(0)
  const contentRef = useRef(null)
  const animRef = useRef(null)
  const posRef = useRef(0)

  // Try to fetch real $BRED price from dexscreener
  useEffect(() => {
    fetch('https://api.dexscreener.com/latest/dex/search?q=BRED')
      .then(r => r.json())
      .then(data => {
        const pair = data?.pairs?.[0]
        if (pair?.priceUsd) setPrice(`$${parseFloat(pair.priceUsd).toFixed(6)}`)
      })
      .catch(() => {})
  }, [])

  // Smooth scroll animation
  useEffect(() => {
    const speed = 0.6
    const animate = () => {
      posRef.current -= speed
      const width = contentRef.current?.scrollWidth / 2 || 800
      if (Math.abs(posRef.current) >= width) posRef.current = 0
      setScrollX(posRef.current)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS] // duplicate for seamless loop

  return (
    <div style={{
      position: 'fixed', bottom: '38px', left: 0, right: 0, height: '24px',
      background: '#0a0a1a',
      borderTop: '1px solid #1a3a8a',
      borderBottom: '1px solid #1a3a8a',
      overflow: 'hidden',
      zIndex: 490,
      display: 'flex', alignItems: 'center',
    }}>
      {/* Label */}
      <div style={{
        background: '#c8a000', color: '#000', fontFamily: '"Tahoma", sans-serif',
        fontSize: '11px', fontWeight: 'bold', padding: '0 8px', height: '100%',
        display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap',
        borderRight: '1px solid #a08000',
      }}>
        $BRED LIVE
      </div>

      {/* Scrolling content */}
      <div style={{ overflow: 'hidden', flex: 1, height: '100%', position: 'relative' }}>
        <div
          ref={contentRef}
          style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            display: 'flex', alignItems: 'center', gap: '0px',
            transform: `translateX(${scrollX}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0 16px', gap: '6px', borderRight: '1px solid #1a3a8a' }}>
              <span style={{ color: '#c8a000', fontFamily: '"Tahoma", sans-serif', fontSize: '11px', fontWeight: 'bold' }}>{item.label}</span>
              <span style={{ color: '#fff', fontFamily: '"Tahoma", sans-serif', fontSize: '11px' }}>
                {item.label === '$BRED' ? price : item.value}
              </span>
              {item.change && (
                <span style={{ color: '#00e87a', fontFamily: '"Tahoma", sans-serif', fontSize: '11px' }}>{item.change}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
