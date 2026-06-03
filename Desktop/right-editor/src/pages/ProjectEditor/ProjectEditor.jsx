import { useState } from 'react'
import { useProject } from '../../hooks/useProject'
import { useVideoUpload } from '../../hooks/useVideoUpload'
import VideoUploader from '../../components/VideoUploader/VideoUploader'
import ProgressTracker from '../../components/ProgressTracker/ProgressTracker'
import Toggle from '../../components/Toggle/Toggle'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import styles from './ProjectEditor.module.css'

const POSITIONS_LOGO = [
  { value: 'top-left',     label: 'Arriba izq.'    },
  { value: 'top-right',    label: 'Arriba der.'    },
  { value: 'bottom-left',  label: 'Abajo izq.'     },
  { value: 'bottom-right', label: 'Abajo der.'     },
  { value: 'center',       label: 'Centro'         },
]

const POSITIONS_SUB = [
  { value: 'top',    label: 'Arriba'  },
  { value: 'center', label: 'Centro'  },
  { value: 'bottom', label: 'Abajo'   },
]

const FONTS = ['Arial', 'Impact', 'Helvetica', 'Roboto', 'Montserrat']

const DEFAULT_OPTIONS = {
  removeSilence: true,
  subtitles: true,
  logo: true,
  subtitleConfig: { font: 'Arial', size: 48, color: '#FFFFFF', position: 'bottom' },
  logoConfig: { position: 'bottom-right', size: 15, opacity: 100 },
}

export default function ProjectEditor({ projectId, onBack }) {
  const { project, loading, error } = useProject(projectId)
  const { uploadVideo, uploading, progress: uploadProgress, error: uploadError } = useVideoUpload()
  const [options, setOptions] = useState(null)
  const [triggering, setTriggering] = useState(false)
  const [triggerError, setTriggerError] = useState(null)

  // Inicializar opciones desde el proyecto cuando carga
  const opts = options ?? (project?.options ?? DEFAULT_OPTIONS)

  function setOpt(key, value) {
    setOptions(prev => ({ ...(prev ?? opts), [key]: value }))
  }

  function setSubConfig(key, value) {
    setOptions(prev => {
      const base = prev ?? opts
      return { ...base, subtitleConfig: { ...base.subtitleConfig, [key]: value } }
    })
  }

  function setLogoConfig(key, value) {
    setOptions(prev => {
      const base = prev ?? opts
      return { ...base, logoConfig: { ...base.logoConfig, [key]: value } }
    })
  }

  async function handleUpload(file) {
    try {
      await uploadVideo(file, projectId)
    } catch {
      // error ya manejado en el hook
    }
  }

  async function handleProcess() {
    setTriggering(true)
    setTriggerError(null)
    try {
      const headers = { 'Content-Type': 'application/json' }
      // Adjuntar secreto compartido si está configurado — N8N debe verificarlo
      const secret = import.meta.env.VITE_N8N_WEBHOOK_SECRET
      if (secret) headers['X-Webhook-Secret'] = secret

      const res = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ project_id: projectId, options: opts }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      setTriggerError('No se pudo conectar con el servidor de procesamiento.')
    } finally {
      setTriggering(false)
    }
  }

  // Sanitizar URLs de Supabase Storage — rechazar cualquier esquema que no sea https
  function safeStorageUrl(url) {
    if (!url) return null
    return /^https:\/\//i.test(url) ? url : null
  }

  if (loading) return <LoadingSkeleton onBack={onBack} />
  if (error) return <ErrorState error={error} onBack={onBack} />

  const isProcessing   = project.status === 'processing'
  const isCompleted    = project.status === 'completed'
  const isError        = project.status === 'error'
  const originalUrl    = safeStorageUrl(project.original_url)
  const processedUrl   = safeStorageUrl(project.processed_url)
  const hasVideo       = !!originalUrl
  const canProcess     = hasVideo && !isProcessing

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
        </div>
      </div>

      {/* Layout */}
      <div className={styles.layout}>
        {/* Panel izquierdo: video */}
        <div className={styles.videoPanel}>
          {!hasVideo ? (
            <VideoUploader
              onFile={handleUpload}
              uploading={uploading}
              progress={uploadProgress}
              error={uploadError}
            />
          ) : isCompleted && processedUrl ? (
            <div className={styles.videoWrap}>
              <video
                src={processedUrl}
                controls
                className={styles.video}
                playsInline
              />
              <div className={styles.videoLabel}>
                <span className={styles.videoLabelDot} style={{ background: 'var(--green)' }} />
                Video procesado
              </div>
            </div>
          ) : (
            <div className={styles.videoWrap}>
              <video
                src={originalUrl}
                controls={!isProcessing}
                className={`${styles.video} ${isProcessing ? styles.videoDim : ''}`}
                playsInline
              />
              <div className={styles.videoLabel}>
                <span className={styles.videoLabelDot} />
                Video original
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho: opciones */}
        <div className={styles.optionsPanel}>

          {/* Error de procesamiento */}
          {isError && (
            <div className={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="var(--error)" strokeWidth="1.3"/>
                <path d="M8 5V8.5M8 10.5V11" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <strong>Error en el procesamiento</strong>
                {project.error_message && <p className={styles.errorMsg}>{project.error_message}</p>}
              </div>
            </div>
          )}

          {/* Progress tracker */}
          {(isProcessing || isCompleted) && (
            <div className={styles.card}>
              <ProgressTracker
                progress={project.progress ?? 0}
                step={project.step}
                status={project.status}
              />
            </div>
          )}

          {/* Opciones de procesamiento */}
          {!isProcessing && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Opciones de procesamiento</h3>
              <div className={styles.toggles}>
                <Toggle
                  label="Quitar silencios"
                  description="FFmpeg elimina pausas de +1 segundo"
                  checked={opts.removeSilence}
                  onChange={v => setOpt('removeSilence', v)}
                  disabled={isProcessing}
                />
                <Toggle
                  label="Subtítulos animados"
                  description="Palabra a palabra, estilo CapCut"
                  checked={opts.subtitles}
                  onChange={v => setOpt('subtitles', v)}
                  disabled={isProcessing}
                />
                <Toggle
                  label="Logo Right Botines"
                  description="Superponer logo en el video"
                  checked={opts.logo}
                  onChange={v => setOpt('logo', v)}
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}

          {/* Config subtítulos */}
          {opts.subtitles && !isProcessing && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Configuración de subtítulos</h3>
              <div className={styles.configGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Fuente</label>
                  <select
                    className={styles.select}
                    value={opts.subtitleConfig.font}
                    onChange={e => setSubConfig('font', e.target.value)}
                    disabled={isProcessing}
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Tamaño: {opts.subtitleConfig.size}px</label>
                  <input
                    type="range" min="24" max="96" step="4"
                    className={styles.range}
                    value={opts.subtitleConfig.size}
                    onChange={e => setSubConfig('size', Number(e.target.value))}
                    disabled={isProcessing}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Color</label>
                  <div className={styles.colorRow}>
                    <input
                      type="color"
                      className={styles.colorPicker}
                      value={opts.subtitleConfig.color}
                      onChange={e => setSubConfig('color', e.target.value)}
                      disabled={isProcessing}
                    />
                    <span className={styles.colorValue}>{opts.subtitleConfig.color}</span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Posición</label>
                  <div className={styles.pills}>
                    {POSITIONS_SUB.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        className={`${styles.pill} ${opts.subtitleConfig.position === p.value ? styles.pillActive : ''}`}
                        onClick={() => setSubConfig('position', p.value)}
                        disabled={isProcessing}
                      >{p.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Config logo */}
          {opts.logo && !isProcessing && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Configuración de logo</h3>
              <div className={styles.configGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Posición</label>
                  <div className={styles.pills}>
                    {POSITIONS_LOGO.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        className={`${styles.pill} ${opts.logoConfig.position === p.value ? styles.pillActive : ''}`}
                        onClick={() => setLogoConfig('position', p.value)}
                        disabled={isProcessing}
                      >{p.label}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Tamaño: {opts.logoConfig.size}%</label>
                  <input
                    type="range" min="5" max="40" step="1"
                    className={styles.range}
                    value={opts.logoConfig.size}
                    onChange={e => setLogoConfig('size', Number(e.target.value))}
                    disabled={isProcessing}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Opacidad: {opts.logoConfig.opacity}%</label>
                  <input
                    type="range" min="20" max="100" step="5"
                    className={styles.range}
                    value={opts.logoConfig.opacity}
                    onChange={e => setLogoConfig('opacity', Number(e.target.value))}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botón procesar */}
          {canProcess && (
            <div className={styles.actionArea}>
              {triggerError && <p className={styles.triggerError}>{triggerError}</p>}
              <button
                className={styles.btnProcess}
                onClick={handleProcess}
                disabled={triggering}
              >
                {triggering ? (
                  <>
                    <span className={styles.btnSpinner} />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M6 4L14 9L6 14V4Z" fill="currentColor"/>
                    </svg>
                    {isCompleted ? 'Procesar de nuevo' : isError ? 'Reintentar procesamiento' : 'Procesar Video'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Descarga cuando completado */}
          {isCompleted && processedUrl && (
            <a
              href={processedUrl}
              download
              target="_blank"
              rel="noreferrer"
              className={styles.btnDownload}
            >
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

function LoadingSkeleton({ onBack }) {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={onBack} style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', marginBottom: 24 }}>
        ← Proyectos
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[140, 220, 160].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 10 }} />
          ))}
        </div>
      </div>
    </main>
  )
}

function ErrorState({ error, onBack }) {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={onBack} style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', marginBottom: 24 }}>
        ← Proyectos
      </button>
      <p style={{ color: 'var(--error)' }}>Error: {error}</p>
    </main>
  )
}
