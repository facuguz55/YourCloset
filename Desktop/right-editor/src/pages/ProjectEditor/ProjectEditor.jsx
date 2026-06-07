import { useState, useCallback } from 'react'
import { useProject } from '../../hooks/useProject'
import { useVideoUpload } from '../../hooks/useVideoUpload'
import CanvasEditor from '../../components/CanvasEditor/CanvasEditor'
import ElementsPanel from '../../components/ElementsPanel/ElementsPanel'
import VideoUploader from '../../components/VideoUploader/VideoUploader'
import ProgressTracker from '../../components/ProgressTracker/ProgressTracker'
import Toggle from '../../components/Toggle/Toggle'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import logoUrl from '../../assets/logo.png'
import styles from './ProjectEditor.module.css'

const FONTS = ['Outfit', 'DM Sans', 'Arial', 'Impact', 'Montserrat']

const DEFAULT_OPTS = {
  removeSilence: true,
  subtitles: true,
  logo: false,
  subtitleConfig: { font: 'Outfit', size: 48, color: '#FFFFFF', position: 'bottom' },
  logoConfig:    { position: 'bottom-right', size: 15, opacity: 100 },
}

function aspectRatioCSS(format) {
  const map = { '16:9': '16/9', '9:16': '9/16', '1:1': '1/1', '4:5': '4/5' }
  return map[format] ?? '16/9'
}

export default function ProjectEditor({ projectId, onBack }) {
  const { project, loading, error } = useProject(projectId)
  const { uploadVideo, uploading, progress: uploadProgress, error: uploadError } = useVideoUpload()

  const [localOpts, setLocalOpts]     = useState(null)
  const [elements, setElements]       = useState(null)
  const [selectedId, setSelectedId]   = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [triggering, setTriggering]   = useState(false)
  const [triggerError, setTriggerError] = useState(null)

  const opts  = localOpts  ?? (project?.options ?? DEFAULT_OPTS)
  const elems = elements   ?? (project?.options?.elements ?? [])

  // ─── opts helpers ─────────────────────────────────────────────────────────
  function setOpt(key, val) {
    setLocalOpts(prev => ({ ...(prev ?? opts), [key]: val }))
  }
  function setSubConfig(key, val) {
    setLocalOpts(prev => {
      const b = prev ?? opts
      return { ...b, subtitleConfig: { ...b.subtitleConfig, [key]: val } }
    })
  }

  // ─── elements helpers ─────────────────────────────────────────────────────
  function updElements(fn) {
    setElements(prev => fn(prev ?? (project?.options?.elements ?? [])))
  }

  const handleSelect = useCallback(id => setSelectedId(id), [])

  const handleMove = useCallback((id, x, y) => {
    updElements(prev => prev.map(el => el.id === id ? { ...el, x, y } : el))
  }, [])

  function handleUpdate(id, patch) {
    updElements(prev => prev.map(el => el.id === id ? { ...el, ...patch } : el))
  }

  function handleDelete(id) {
    updElements(prev => prev.filter(el => el.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function handleAddText() {
    const id = crypto.randomUUID()
    const newEl = {
      id,
      type: 'text',
      content: 'Nuevo texto',
      x: 0.05,
      y: 0.75,
      fontSize: 0.07,
      font: 'Outfit',
      color: '#ffffff',
      bgColor: null,
      bold: false,
      opacity: 1,
      startTime: videoDuration > 0 ? Math.round(currentTime * 10) / 10 : null,
      endTime:   videoDuration > 0 ? Math.round((currentTime + 3) * 10) / 10 : null,
    }
    updElements(prev => [...prev, newEl])
    setSelectedId(id)
  }

  function handleAddLogo() {
    const id = crypto.randomUUID()
    const newEl = {
      id,
      type: 'logo',
      src: logoUrl,
      x: 0.75,
      y: 0.78,
      width: 0.15,
      opacity: 1,
      startTime: null,
      endTime: null,
    }
    updElements(prev => [...prev, newEl])
    setSelectedId(id)
  }

  function handleAddImage(file) {
    const id = crypto.randomUUID()
    const src = URL.createObjectURL(file)
    const newEl = {
      id,
      type: 'image',
      src,
      x: 0.1,
      y: 0.1,
      width: 0.3,
      opacity: 1,
      startTime: null,
      endTime: null,
    }
    updElements(prev => [...prev, newEl])
    setSelectedId(id)
  }

  // ─── upload ───────────────────────────────────────────────────────────────
  async function handleUpload(file) {
    try { await uploadVideo(file, projectId) } catch { /* handled in hook */ }
  }

  // ─── process ──────────────────────────────────────────────────────────────
  async function handleProcess() {
    setTriggering(true)
    setTriggerError(null)
    try {
      const headers = { 'Content-Type': 'application/json' }
      const secret = import.meta.env.VITE_N8N_WEBHOOK_SECRET
      if (secret) headers['X-Webhook-Secret'] = secret
      const res = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ project_id: projectId, options: { ...opts, elements: elems } }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {
      setTriggerError('No se pudo conectar con el servidor de procesamiento.')
    } finally {
      setTriggering(false)
    }
  }

  function safeUrl(url) {
    if (!url) return null
    return /^https:\/\//i.test(url) ? url : null
  }

  if (loading) return <LoadingSkeleton onBack={onBack} />
  if (error)   return <ErrorState error={error} onBack={onBack} />

  const isProcessing = project.status === 'processing'
  const isCompleted  = project.status === 'completed'
  const isError      = project.status === 'error'
  const originalUrl  = safeUrl(project.original_url)
  const processedUrl = safeUrl(project.processed_url)
  const hasVideo     = !!originalUrl
  const canProcess   = hasVideo && !isProcessing
  const videoSrc     = isCompleted && processedUrl ? processedUrl : originalUrl
  const ar           = aspectRatioCSS(project.format)

  return (
    <main className={styles.main}>

      {/* Top bar */}
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Proyectos
        </button>
        <div className={styles.topbarCenter}>
          <h2 className={styles.projectName}>{project.name}</h2>
          <StatusBadge status={project.status} />
        </div>
        <div className={styles.topbarRight}>
          {project.format && <span className={styles.formatTag}>{project.format}</span>}
          {elems.length > 0 && (
            <span className={styles.elemCount}>
              {elems.length} elemento{elems.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className={styles.layout}>

        {/* Canvas / video panel */}
        <div className={styles.canvasCol}>
          {!hasVideo ? (
            <div className={styles.uploaderWrap}>
              <VideoUploader
                onFile={handleUpload}
                uploading={uploading}
                progress={uploadProgress}
                error={uploadError}
              />
            </div>
          ) : (
            <>
              <CanvasEditor
                videoSrc={videoSrc}
                elements={elems}
                selectedId={selectedId}
                aspectRatio={ar}
                onSelect={handleSelect}
                onMoveElement={handleMove}
                onTimeUpdate={setCurrentTime}
                onDurationLoaded={setVideoDuration}
              />
              {isCompleted && processedUrl && (
                <div className={styles.videoLabel}>
                  <span className={styles.dot} style={{ background: 'var(--green)' }} />
                  Viendo video procesado
                </div>
              )}
              {!isCompleted && hasVideo && (
                <div className={styles.videoLabel}>
                  <span className={styles.dot} />
                  Video original
                  {videoDuration > 0 && (
                    <span className={styles.duration}>{fmtDuration(videoDuration)}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right panel */}
        <div className={styles.sidePanel}>

          {/* Error */}
          {isError && (
            <div className={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="7" stroke="var(--error)" strokeWidth="1.3"/>
                <path d="M8 5V8.5M8 10.5V11" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <strong>Error en el procesamiento</strong>
                {project.error_message && <p className={styles.errorMsg}>{project.error_message}</p>}
              </div>
            </div>
          )}

          {/* Progress */}
          {(isProcessing || isCompleted) && (
            <div className={styles.card}>
              <ProgressTracker
                progress={project.progress ?? 0}
                step={project.step}
                status={project.status}
              />
            </div>
          )}

          {/* Elements panel (only when has video) */}
          {hasVideo && !isProcessing && (
            <ElementsPanel
              elements={elems}
              selectedId={selectedId}
              videoDuration={videoDuration}
              onAddText={handleAddText}
              onAddLogo={handleAddLogo}
              onAddImage={handleAddImage}
              onSelect={handleSelect}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}

          {/* Auto-processing */}
          {!isProcessing && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Procesamiento automático</h3>
              <div className={styles.toggleGroup}>
                <Toggle
                  label="Quitar silencios"
                  description="FFmpeg elimina pausas de +1 seg"
                  checked={opts.removeSilence}
                  onChange={v => setOpt('removeSilence', v)}
                />
                <Toggle
                  label="Subtítulos animados"
                  description="Palabra a palabra vía Whisper"
                  checked={opts.subtitles}
                  onChange={v => setOpt('subtitles', v)}
                />
              </div>

              {opts.subtitles && (
                <div className={styles.subConfig}>
                  <div className={styles.subRow}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Fuente subtítulos</label>
                      <select
                        className={styles.select}
                        value={opts.subtitleConfig.font}
                        onChange={e => setSubConfig('font', e.target.value)}
                      >
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Color</label>
                      <input
                        type="color"
                        className={styles.colorPicker}
                        value={opts.subtitleConfig.color}
                        onChange={e => setSubConfig('color', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Tamaño: {opts.subtitleConfig.size}px</label>
                    <input
                      type="range" min="24" max="96" step="4"
                      className={styles.range}
                      value={opts.subtitleConfig.size}
                      onChange={e => setSubConfig('size', Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Process button */}
          {canProcess && (
            <div className={styles.actionArea}>
              {triggerError && <p className={styles.triggerError}>{triggerError}</p>}
              <button
                className={styles.btnProcess}
                onClick={handleProcess}
                disabled={triggering}
              >
                {triggering ? (
                  <><span className={styles.spinner} /> Iniciando...</>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M6 4L14 9L6 14V4Z" fill="currentColor"/>
                    </svg>
                    {isCompleted ? 'Reprocesar' : isError ? 'Reintentar' : 'Procesar video'}
                    {elems.length > 0 && ` + ${elems.length} elemento${elems.length > 1 ? 's' : ''}`}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Download */}
          {isCompleted && processedUrl && (
            <a href={processedUrl} download target="_blank" rel="noreferrer" className={styles.btnDownload}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3V12M9 12L5 8M9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Descargar video procesado
            </a>
          )}

        </div>
      </div>
    </main>
  )
}

function fmtDuration(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function LoadingSkeleton({ onBack }) {
  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={onBack} style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', marginBottom: 24 }}>
        ← Proyectos
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[120, 200, 160].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 10 }} />
          ))}
        </div>
      </div>
    </main>
  )
}

function ErrorState({ error, onBack }) {
  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={onBack} style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', marginBottom: 24 }}>
        ← Proyectos
      </button>
      <p style={{ color: 'var(--error)' }}>Error: {error}</p>
    </main>
  )
}
