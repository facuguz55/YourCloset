import { useState } from 'react'
import styles from './NewProjectModal.module.css'

const FORMATS = [
  { value: '16:9',   label: '16:9',   desc: 'Horizontal' },
  { value: '9:16',   label: '9:16',   desc: 'Vertical / Reels' },
  { value: '1:1',    label: '1:1',    desc: 'Cuadrado' },
  { value: '4:5',    label: '4:5',    desc: 'Portrait' },
  { value: 'custom', label: 'Custom', desc: 'Personalizado' },
]

const DEFAULT_OPTIONS = {
  removeSilence: true,
  subtitles: true,
  logo: true,
  subtitleConfig: { font: 'Arial', size: 48, color: '#FFFFFF', position: 'bottom' },
  logoConfig: { position: 'bottom-right', size: 15, opacity: 100 },
}

export default function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [format, setFormat] = useState('9:16')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      await onCreate({ name: name.trim(), format, options: DEFAULT_OPTIONS })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al crear el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Nuevo Proyecto</h2>
          <button className={styles.close} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Nombre */}
          <div className={styles.field}>
            <label className={styles.label}>Nombre del proyecto</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ej: Campaña Instagram — Junio"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Formato */}
          <div className={styles.field}>
            <label className={styles.label}>Formato de video</label>
            <div className={styles.formats}>
              {FORMATS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  className={`${styles.formatBtn} ${format === f.value ? styles.formatActive : ''}`}
                  onClick={() => setFormat(f.value)}
                >
                  <span className={styles.formatLabel}>{f.label}</span>
                  <span className={styles.formatDesc}>{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnCreate} disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Creando...
                </>
              ) : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
