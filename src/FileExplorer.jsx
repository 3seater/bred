import { useState, useRef, useEffect, useCallback } from 'react'

const XP = {
  titleBar: 'linear-gradient(180deg, #0a246a 0%, #3a6ea5 8%, #0a246a 100%)',
  toolbar: 'linear-gradient(180deg, #f8f6f0 0%, #e8e4da 100%)',
  addressBar: '#fff',
  sidebar: '#e8f0fb',
  sidebarBorder: '#b8cce8',
  windowBg: '#fff',
  border: '#0831d9',
  borderShadow: '#848284',
  borderLight: '#ffffff',
  selectedBg: 'rgba(49,106,197,0.25)',
  selectedBorder: '#316ac5',
}

function useDraggable(initial) {
  const [pos, setPos] = useState(initial)
  const dragging = useRef(false)
  const origin = useRef({})

  const onMouseDown = useCallback((e) => {
    if (['INPUT', 'BUTTON', 'A'].includes(e.target.tagName)) return
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, ex: pos.x, ey: pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      setPos({ x: origin.current.ex + e.clientX - origin.current.mx, y: origin.current.ey + e.clientY - origin.current.my })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return [pos, onMouseDown]
}

// ── File item ───────────────────────────────────────────────────────
function FileItem({ file, selected, onSelect, onOpen }) {
  const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
  const isVideo = /\.(mp4|webm|mov)$/i.test(file.name)

  const icon = isImage ? '🖼️' : isVideo ? '🎬' : '📄'

  return (
    <div
      onClick={() => onSelect(file.name)}
      onDoubleClick={() => onOpen(file)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        width: '80px',
        padding: '6px 4px',
        borderRadius: '2px',
        background: selected ? XP.selectedBg : 'transparent',
        border: selected ? `1px dotted ${XP.selectedBorder}` : '1px solid transparent',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {isImage ? (
        <img
          src={file.url}
          alt={file.name}
          style={{ width: '48px', height: '48px', objectFit: 'cover', imageRendering: 'pixelated', border: '1px solid #ccc' }}
        />
      ) : (
        <span style={{ fontSize: '38px', lineHeight: 1 }}>{icon}</span>
      )}
      <span style={{
        fontSize: '11px',
        fontFamily: '"Tahoma", sans-serif',
        textAlign: 'center',
        color: '#000',
        wordBreak: 'break-all',
        lineHeight: 1.3,
        maxWidth: '76px',
        background: selected ? '#316ac5' : 'transparent',
        color: selected ? '#fff' : '#000',
        padding: '0 2px',
      }}>
        {file.name}
      </span>
    </div>
  )
}

// ── Lightbox for previewing images ─────────────────────────────────
function Lightbox({ file, files, onClose, onNav }) {
  if (!file) return null
  const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
  const isVideo = /\.(mp4|webm|mov)$/i.test(file.name)
  const [copied, setCopied] = useState(false)

  const idx = files.findIndex(f => f.name === file.name)
  const hasPrev = idx > 0
  const hasNext = idx < files.length - 1

  // Keyboard arrow navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft' && hasPrev) onNav(files[idx - 1])
      if (e.key === 'ArrowRight' && hasNext) onNav(files[idx + 1])
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, hasPrev, hasNext])

  async function handleCopy() {
    try {
      const res = await fetch(file.url)
      const blob = await res.blob()
      // Ensure it's a supported type (Chrome only supports image/png for clipboard)
      if (blob.type === 'image/png') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
      } else {
        // Convert to PNG via canvas first
        const img = new Image()
        const url = URL.createObjectURL(blob)
        img.src = url
        await new Promise(r => { img.onload = r })
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext('2d').drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        canvas.toBlob(async (pngBlob) => {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob })
          ])
        }, 'image/png')
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Copy failed:', e)
      // Last resort — open image in new tab so user can copy manually
      window.open(file.url, '_blank')
    }
  }

  function handleDownload() {
    const a = document.createElement('a')
    a.href = file.url
    a.download = file.name
    a.click()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Prev arrow */}
        {hasPrev && (
          <button onClick={() => onNav(files[idx - 1])} style={{
            position: 'absolute', left: '-52px', top: '50%', transform: 'translateY(-50%)',
            width: '40px', height: '40px', background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: '3px',
            color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
        )}

        {/* Next arrow */}
        {hasNext && (
          <button onClick={() => onNav(files[idx + 1])} style={{
            position: 'absolute', right: '-52px', top: '50%', transform: 'translateY(-50%)',
            width: '40px', height: '40px', background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: '3px',
            color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>›</button>
        )}
        {isImage && (
          <img src={file.url} alt={file.name} style={{ maxWidth: '90vw', maxHeight: '78vh', display: 'block', border: '2px solid #fff' }} />
        )}
        {isVideo && (
          <video src={file.url} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '78vh', border: '2px solid #fff' }} />
        )}

        {/* Bottom action bar — XP style */}
        <div style={{
          background: 'linear-gradient(180deg, #0a246a 0%, #3a6ea5 8%, #0a246a 100%)',
          padding: '5px 8px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: '"Tahoma", sans-serif',
        }}>
          <span style={{ color: '#fff', fontSize: '11px', opacity: 0.8 }}>{file.name}</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#3a8a3a' : 'linear-gradient(180deg, #f8f8f8 0%, #d8d0c8 100%)',
                border: '1px solid #666', borderRadius: '2px',
                padding: '2px 10px', fontSize: '11px',
                fontFamily: '"Tahoma", sans-serif', cursor: 'pointer',
                color: copied ? '#fff' : '#000',
              }}
            >{copied ? '✓ Copied!' : '📋 Copy image'}</button>
            <button
              onClick={handleDownload}
              style={{
                background: 'linear-gradient(180deg, #f8f8f8 0%, #d8d0c8 100%)',
                border: '1px solid #666', borderRadius: '2px',
                padding: '2px 10px', fontSize: '11px',
                fontFamily: '"Tahoma", sans-serif', cursor: 'pointer',
              }}
            >⬇ Download</button>
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(180deg, #f88 0%, #c00 100%)',
                border: '1px solid #666', borderRadius: '2px',
                padding: '2px 8px', fontSize: '11px',
                fontFamily: '"Tahoma", sans-serif', cursor: 'pointer', color: '#fff',
              }}
            >✕</button>
          </div>
        </div>
      </div>
    </div>
  )
}
// ── Main explorer window ────────────────────────────────────────────
export default function FileExplorer({ onClose }) {
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(null)
  const [size, setSize] = useState({ w: 580, h: 400 })
  const resizing = useRef(false)
  const resizeOrigin = useRef({})

  const [pos, onDragStart] = useDraggable({
    x: Math.max(0, window.innerWidth / 2 - 290),
    y: Math.max(0, window.innerHeight / 2 - 200),
  })

  // Fetch memes directory listing from Vite's static server
  useEffect(() => {
    // We expose a manifest of meme files via a generated JSON
    fetch('/memes/manifest.json')
      .then(r => r.ok ? r.json() : [])
      .then(names => {
        setFiles(names.map(name => ({
          name,
          url: `/memes/${name}`,
        })))
      })
      .catch(() => setFiles([]))
  }, [])

  const onResizeMouseDown = (e) => {
    e.stopPropagation(); e.preventDefault()
    resizing.current = true
    resizeOrigin.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h }
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!resizing.current) return
      setSize({
        w: Math.max(320, resizeOrigin.current.w + e.clientX - resizeOrigin.current.mx),
        h: Math.max(200, resizeOrigin.current.h + e.clientY - resizeOrigin.current.my),
      })
    }
    const onUp = () => { resizing.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return (
    <>
      <div style={{
        position: 'fixed', left: pos.x, top: pos.y,
        width: size.w, height: size.h,
        fontFamily: '"Tahoma", "MS Sans Serif", sans-serif',
        fontSize: '12px',
        border: `2px solid ${XP.border}`,
        borderRadius: '6px 6px 4px 4px',
        boxShadow: `2px 2px 0 ${XP.borderShadow}, -1px -1px 0 ${XP.borderShadow}, inset 1px 1px 0 ${XP.borderLight}`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        zIndex: 300,
      }}>
        {/* Title bar */}
        <div
          onMouseDown={onDragStart}
          style={{
            background: XP.titleBar, padding: '4px 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'grab', userSelect: 'none', flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '12px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }}>
            <span>📁</span> memes
          </div>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={onClose}
            style={{
              width: '20px', height: '18px',
              background: 'linear-gradient(180deg, #f88 0%, #c00 100%)',
              border: '1px solid #666', borderRadius: '2px',
              color: '#fff', fontSize: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5)',
            }}
          >✕</button>
        </div>

        {/* Toolbar */}
        <div style={{
          background: XP.toolbar,
          borderBottom: '1px solid #b0a890',
          padding: '3px 8px',
          display: 'flex', gap: '2px', flexShrink: 0,
        }}>
          {['Back', 'Forward', 'Up'].map(lbl => (
            <button key={lbl} style={{
              background: 'linear-gradient(180deg, #f8f8f8 0%, #d8d0c8 100%)',
              border: '1px solid #999', borderRadius: '2px',
              padding: '1px 8px', fontSize: '11px', fontFamily: 'inherit',
              cursor: 'default', color: '#888',
            }}>{lbl}</button>
          ))}
          <div style={{ flex: 1, margin: '0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#444' }}>Address:</span>
            <div style={{
              flex: 1, background: '#fff', border: '1px inset #999',
              padding: '1px 6px', fontSize: '11px', color: '#000',
              fontFamily: 'inherit',
            }}>C:\bred\memes</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left sidebar */}
          <div style={{
            width: '140px', flexShrink: 0,
            background: XP.sidebar,
            borderRight: `1px solid ${XP.sidebarBorder}`,
            padding: '10px 8px',
            overflowY: 'auto',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#316ac5', marginBottom: '6px' }}>File and Folder Tasks</div>
            <div style={{ fontSize: '11px', color: '#316ac5', cursor: 'default', marginBottom: '4px' }}>🗁 New Folder</div>
            <div style={{ fontSize: '11px', color: '#316ac5', cursor: 'default', marginBottom: '4px' }}>📤 Share folder</div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>🗑 Delete</div>
            <hr style={{ border: 'none', borderTop: '1px solid #b8cce8', margin: '8px 0' }} />
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#316ac5', marginBottom: '6px' }}>Other Places</div>
            <div style={{ fontSize: '11px', color: '#316ac5', cursor: 'default', marginBottom: '4px' }}>🖥 My Computer</div>
            <div style={{ fontSize: '11px', color: '#316ac5', cursor: 'default', marginBottom: '4px' }}>🌐 My Network</div>
          </div>

          {/* File grid */}
          <div
            style={{
              flex: 1, background: XP.windowBg,
              padding: '8px',
              overflowY: 'auto',
              display: 'flex', flexWrap: 'wrap',
              alignContent: 'flex-start',
              gap: '4px',
            }}
            onClick={() => setSelected(null)}
          >
            {files.length === 0 ? (
              <div style={{ color: '#888', fontSize: '12px', padding: '20px', width: '100%', textAlign: 'center' }}>
                This folder is empty.<br />
                <span style={{ fontSize: '11px' }}>Drop images into public/memes/ and add them to manifest.json</span>
              </div>
            ) : (
              files.map(f => (
                <FileItem
                  key={f.name}
                  file={f}
                  selected={selected === f.name}
                  onSelect={setSelected}
                  onOpen={setPreview}
                />
              ))
            )}
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          background: '#ece9d8', borderTop: '1px solid #b0a890',
          padding: '2px 8px', fontSize: '11px', color: '#444',
          display: 'flex', justifyContent: 'space-between', flexShrink: 0,
          position: 'relative',
        }}>
          <span>{files.length} object{files.length !== 1 ? 's' : ''}</span>
          {selected && <span>{selected}</span>}

          {/* Resize grip */}
          <div onMouseDown={onResizeMouseDown} style={{ position: 'absolute', right: 0, bottom: 0, width: '14px', height: '14px', cursor: 'nwse-resize', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '2px' }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="6" y="6" width="2" height="2" fill="#999" />
              <rect x="3" y="6" width="2" height="2" fill="#999" />
              <rect x="6" y="3" width="2" height="2" fill="#999" />
            </svg>
          </div>
        </div>
      </div>

      {preview && <Lightbox file={preview} files={files} onClose={() => setPreview(null)} onNav={setPreview} />}
    </>
  )
}
