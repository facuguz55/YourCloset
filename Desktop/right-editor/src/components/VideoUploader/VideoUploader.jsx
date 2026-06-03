import { useRef, useState } from 'react'
import styles from './VideoUploader.module.css'

const ACCEPTED = ['.mp4', '.mov', '.m4v', '.hevc', '.heic']
const ACCEPTED_MIME = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/hevc']

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function VideoUploader({ onFile, uploading, progress, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  function handleFile(file) {
    if (!file) return
    setSelectedFile(file)
    onFile(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e) {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  if (uploading || (selectedFile && progress > 0)) {
    return (
      <div className={styles.uploadingState}>
        <div className={styles.uploadIcon}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L16 20M16 4L10 10M16 4L22 10" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 24V26C4 27.1046 4.89543 28 6 28H26C27.1046 28 28 27.1046 28 26V24" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className={styles.uploadingLabel}>Subiendo video...</p>
        <p className={styles.uploadingFile}>{selectedFile?.name}</p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.progressPct}>{progress}%</p>
      </div>
    )
  }

  return (
    <div
      className={`${styles.zone} ${dragging ? styles.dragging : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className={styles.hidden}
        onChange={onInputChange}
      />

      <div className={styles.iconWrap}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="var(--cyan-dim)"/>
          <path d="M20 12L20 24M20 12L14 18M20 12L26 18" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 30V31C10 31.5523 10.4477 32 11 32H29C29.5523 32 30 31.5523 30 31V30" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <p className={styles.title}>
        {dragging ? 'Soltá el video aquí' : 'Arrastrá tu video aquí'}
      </p>
      <p className={styles.sub}>o hacé clic para seleccionar</p>
      <p className={styles.formats}>{ACCEPTED.join('  ·  ')}</p>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
