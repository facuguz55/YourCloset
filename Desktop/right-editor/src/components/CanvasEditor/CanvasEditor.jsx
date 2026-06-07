import { useRef, useState, useEffect, useCallback } from 'react'
import styles from './CanvasEditor.module.css'

export default function CanvasEditor({
  videoSrc,
  elements = [],
  selectedId,
  aspectRatio = '16/9',
  onSelect,
  onMoveElement,
  onTimeUpdate,
  onDurationLoaded,
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [cw, setCw] = useState(0)
  const [ch, setCh] = useState(0)
  const [dragging, setDragging] = useState(null)
  const [localTime, setLocalTime] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setCw(width)
      setCh(height)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const startDrag = useCallback((e, elementId) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect?.(elementId)
    const el = elements.find(x => x.id === elementId)
    if (!el || !containerRef.current) return
    setDragging({
      id: elementId,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    })
  }, [elements, onSelect])

  useEffect(() => {
    if (!dragging) return

    function onMove(e) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const dx = (e.clientX - dragging.startX) / rect.width
      const dy = (e.clientY - dragging.startY) / rect.height
      onMoveElement?.(
        dragging.id,
        Math.max(0, Math.min(0.88, dragging.origX + dx)),
        Math.max(0, Math.min(0.88, dragging.origY + dy)),
      )
    }

    function onUp() { setDragging(null) }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, onMoveElement])

  function handleTimeUpdate() {
    const t = videoRef.current?.currentTime ?? 0
    setLocalTime(t)
    onTimeUpdate?.(t)
  }

  function handleDurationChange() {
    onDurationLoaded?.(videoRef.current?.duration ?? 0)
  }

  const visible = elements.filter(el => {
    const start = el.startTime ?? -Infinity
    const end = el.endTime ?? Infinity
    return localTime >= start && localTime <= end
  })

  return (
    <div
      ref={containerRef}
      className={`${styles.canvas} ${dragging ? styles.dragging : ''}`}
      style={{ aspectRatio }}
      onClick={e => { if (e.target === containerRef.current) onSelect?.(null) }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className={styles.video}
        controls
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
      />

      <div className={styles.overlay}>
        {visible.map(el => (
          <CanvasElement
            key={el.id}
            el={el}
            selected={selectedId === el.id}
            isDragging={dragging?.id === el.id}
            cw={cw}
            ch={ch}
            onMouseDown={e => startDrag(e, el.id)}
          />
        ))}
      </div>

      {selectedId && (
        <div className={styles.hint}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Arrastrá para mover
        </div>
      )}
    </div>
  )
}

function CanvasElement({ el, selected, isDragging, cw, ch, onMouseDown }) {
  const base = {
    position: 'absolute',
    left: `${el.x * 100}%`,
    top: `${el.y * 100}%`,
    opacity: el.opacity ?? 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    pointerEvents: 'auto',
    userSelect: 'none',
    zIndex: selected ? 10 : 1,
    outline: selected ? '2px solid #00d4ff' : 'none',
    outlineOffset: 3,
    borderRadius: 4,
    boxShadow: selected ? '0 0 16px rgba(0,212,255,0.45)' : 'none',
    transition: selected ? 'none' : 'box-shadow 150ms',
  }

  if (el.type === 'text') {
    const fs = ch > 0 ? Math.round(ch * (el.fontSize ?? 0.06)) : 24
    return (
      <div
        style={{
          ...base,
          fontFamily: `${el.font ?? 'Outfit'}, sans-serif`,
          fontSize: fs,
          fontWeight: el.bold ? 700 : 600,
          color: el.color ?? '#ffffff',
          backgroundColor: el.bgColor ? el.bgColor + 'cc' : 'transparent',
          padding: el.bgColor ? '4px 12px' : '2px 4px',
          whiteSpace: 'nowrap',
          lineHeight: 1.25,
          textShadow: '0 1px 6px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.6)',
        }}
        onMouseDown={onMouseDown}
      >
        {el.content || 'Texto'}
      </div>
    )
  }

  if (el.type === 'logo' || el.type === 'image') {
    const w = cw > 0 ? Math.round(cw * (el.width ?? 0.15)) : 80
    return (
      <div
        style={{ ...base, width: w }}
        onMouseDown={onMouseDown}
      >
        <img
          src={el.src}
          alt=""
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 4 }}
          draggable={false}
        />
      </div>
    )
  }

  return null
}
