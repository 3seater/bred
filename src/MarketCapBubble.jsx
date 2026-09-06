import { useState, useEffect } from 'react'

// XP-style system tray notification — bottom right, above taskbar
// Shows $BRED market cap. Placeholder until real API is wired.
export default function MarketCapBubble() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [marketCap, setMarketCap] = useState(null)
  const [price, setPrice] = useState(null)
  const [change, setChange] = useState(null)

  // Show after 2s on load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Fetch from dexscreener — swap in real contract address when ready
  useEffect(() => {
    // Placeholder: tries to fetch, falls back to mock data gracefully
    fetch('https://api.dexscreener.com/latest/dex/search?q=BRED%20SOL')
      .then(r => r.json())
      .then(data => {
        const pair = data?.pairs?.[0]
        if (pair) {
          if (pair.fdv)         setMarketCap(formatNum(pair.fdv))
          if (pair.priceUsd)    setPrice(`$${parseFloat(pair.priceUsd).toFixed(6)}`)
          if (pair.priceChange?.h24 !== undefined) {
            const c = pair.priceChange.h24
            setChange({ val: c.toFixed(2), up: c >= 0 })
          }
        }
      })
      .catch(() => {})
  }, [])

  if (dismissed || !visible) return null

  const mcDisplay  = marketCap ?? '---'
  const priceDisplay = price ?? '$0.000000'
  const changeDisplay = change ? `${change.up ? '+' : ''}${change.val}%` : '---'
  const changeColor   = change ? (change.up ? '#00c853' : '#d50000') : '#888'

  return (
    <div style={{
      position: 'fixed',
      bottom: '42px',
      right: '8px',
      width: '240px',
      background: '#fffde7',
      border: '1px solid #c8a000',
      borderRadius: '6px 6px 6px 0',
      boxShadow: '2px 2px 6px rgba(0,0,0,0.35)',
      fontFamily: '"Tahoma", sans-serif',
      zIndex: 600,
      overflow: 'hidden',
      // XP balloon shape — pointer at bottom-left
    }}>
      {/* Title bar */}
      <div style={{
        background: 'linear-gradient(180deg, #0a246a 0%, #3a6ea5 8%, #0a246a 100%)',
        padding: '3px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fff', fontSize: '11px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }}>
          <span>📈</span> $BRED Market Update
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{ width: '14px', height: '13px', background: 'linear-gradient(180deg, #f88 0%, #c00 100%)', border: '1px solid #666', borderRadius: '2px', color: '#fff', fontSize: '8px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
      </div>

      {/* Content */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#555' }}>Market Cap</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>{mcDisplay}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#555' }}>Price</span>
          <span style={{ fontSize: '12px', color: '#000' }}>{priceDisplay}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#555' }}>24h Change</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: changeColor }}>{changeDisplay}</span>
        </div>

        <div style={{ borderTop: '1px solid #e0c840', marginTop: '2px', paddingTop: '5px', fontSize: '10px', color: '#888' }}>
          Powered by DexScreener · Click to trade
        </div>
      </div>

      {/* XP balloon tail */}
      <div style={{
        position: 'absolute', bottom: '-8px', left: '16px',
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '0px solid transparent',
        borderTop: '8px solid #c8a000',
      }} />
      <div style={{
        position: 'absolute', bottom: '-6px', left: '17px',
        width: 0, height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '0px solid transparent',
        borderTop: '7px solid #fffde7',
      }} />
    </div>
  )
}

function formatNum(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n}`
}
