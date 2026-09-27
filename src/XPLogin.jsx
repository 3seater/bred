import { useState, useRef, useEffect } from 'react'

export default function XPLogin({ onLogin, onLogout }) {
  const [hovered, setHovered] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const passwordInput = useRef(null)
  const loginTimer = useRef(null)
  useEffect(() => () => clearTimeout(loginTimer.current), [])

  function handleSubmit(e) {
    e.preventDefault()
    if (loggingIn) return
    if (password !== '13371337') {
      setError('incorrect password. please try again.')
      setPassword('')
      passwordInput.current?.focus()
      return
    }
    setError('')
    setClicking(true)
    setLoggingIn(true)
    loginTimer.current = setTimeout(() => onLogin(), 500)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Tahoma", sans-serif',
      opacity: loggingIn ? 0 : 1,
      transition: loggingIn ? 'opacity 0.4s ease' : 'none',
      pointerEvents: loggingIn ? 'none' : 'all',
    }}>

      {/* ── Top blue band ── */}
      <div style={{
        height: '12%', flexShrink: 0,
        background: 'linear-gradient(180deg, #1a42b8 0%, #2858cc 60%, #3060d8 100%)',
        borderBottom: '2px solid #e8a800',
      }} />

      {/* ── Main body ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #3a70e0 0%, #2858cc 50%, #3060d8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Central panel — fixed width, two columns with divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '72%',
          maxWidth: '860px',
          gap: 0,
        }}>
          {/* Left: branding — right-aligned to the divider */}
          <div style={{
            flex: '0 0 50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '14px',
            paddingRight: '40px',
            borderRight: '1px solid rgba(255,255,255,0.3)',
          }}>
            {/* bred OS wordmark */}
            <div style={{ textAlign: 'right', lineHeight: 1 }}>
              <div style={{
                fontSize: '12px', color: '#c8d8ff',
                letterSpacing: '0.05em', marginBottom: '2px',
              }}>bred®</div>
              <div style={{
                display: 'flex', alignItems: 'baseline',
                gap: '4px', justifyContent: 'flex-end',
              }}>
                <span style={{
                  fontSize: '56px', fontWeight: 'bold', color: '#fff',
                  textShadow: '1px 2px 6px rgba(0,0,0,0.35)',
                  fontFamily: '"Franklin Gothic Medium", "Tahoma", sans-serif',
                  fontStyle: 'italic', letterSpacing: '-1px',
                }}>bred</span>
                <span style={{
                  fontSize: '28px', color: '#f0c040',
                  fontStyle: 'italic', fontWeight: 'bold',
                  fontFamily: '"Franklin Gothic Medium", "Tahoma", sans-serif',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                  marginBottom: '4px',
                }}>OS</span>
              </div>
            </div>

            <div style={{
              color: '#d0e4ff', fontSize: '16px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              marginTop: '4px', textAlign: 'right',
            }}>
              To begin, enter your password
            </div>
          </div>

          {/* Right: user tile */}
          <div style={{
            flex: '0 0 50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingLeft: '48px',
          }}>
            <div
              onClick={() => passwordInput.current?.focus()}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '4px',
                background: hovered ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'background 0.12s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '64px', height: '64px',
                border: '3px solid rgba(255,255,255,0.75)',
                borderRadius: '3px',
                overflow: 'hidden', flexShrink: 0,
                boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
                transform: clicking ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.1s',
              }}>
                <img src="/favicon.png" alt="bred user"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }} />
              </div>

              {/* Name */}
              <div>
                <div style={{
                  color: '#fff', fontSize: '20px', fontWeight: 'bold',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                }}>bred user</div>
                <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
                  <label htmlFor="login-password" style={{ display: 'block', color: '#d0e4ff', fontSize: '12px', marginBottom: '4px' }}>password</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      ref={passwordInput}
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      disabled={loggingIn}
                      aria-invalid={!!error}
                      aria-describedby={error ? 'login-error' : undefined}
                      style={{ width: '140px', minWidth: 0, padding: '5px 6px', fontFamily: '"Tahoma", sans-serif', fontSize: '14px', background: '#fff', color: '#000', border: '2px inset #d4d0c8', borderRadius: '2px' }}
                    />
                    <button type="submit" aria-label="Log on" disabled={loggingIn} style={{ width: '28px', height: '28px', padding: 0, color: '#fff', background: 'linear-gradient(180deg, #7dc765, #368322)', border: '1px solid #fff', borderRadius: '3px', boxShadow: '1px 1px 2px #174a20', cursor: 'pointer' }}>
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges"><path fill="white" d="M8 2h2v2h2v2h2v4h-2v2h-2v2H8v-4H2V6h6z" /></svg>
                    </button>
                  </div>
                  {error && <div id="login-error" role="alert" style={{ color: '#fff3bc', fontSize: '11px', marginTop: '6px', maxWidth: '180px' }}>{error}</div>}
                </form>
                {loggingIn && (
                  <div style={{ color: '#c0d8ff', fontSize: '12px', marginTop: '3px' }}>
                    Loading your profile...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        height: '12%', flexShrink: 0,
        background: 'linear-gradient(180deg, #2050c0 0%, #1a42b8 100%)',
        borderTop: '2px solid #e8a800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
      }}>
        {/* Turn off computer — goes back to login */}
        <div onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          {/* Orange rounded square button with power ring */}
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(160deg, #f07030 0%, #d04010 100%)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {/* Power symbol — circle with gap + vertical line */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2 L9 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M5.5 4.2 A6 6 0 1 0 12.5 4.2" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span style={{
            color: '#fff', fontSize: '15px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
          }}>
            Turn off computer
          </span>
        </div>

        {/* Right hint */}
        <div style={{
          color: '#c0d0f0', fontSize: '11px',
          textAlign: 'right', lineHeight: 1.7,
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        }}>
          After you log on, you can add or change accounts.<br />
          Just go to Control Panel and click User Accounts.
        </div>
      </div>
    </div>
  )
}
