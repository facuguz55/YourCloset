import StatusBadge from '../StatusBadge/StatusBadge'
import styles from './ProjectCard.module.css'

function formatDuration(secs) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export default function ProjectCard({ project, onClick }) {
  const { name, format, status, progress, thumbnail_url, duration, created_at, step } = project

  return (
    <article className={styles.card} onClick={() => onClick(project)}>
      {/* Thumbnail */}
      <div className={styles.thumb}>
        {thumbnail_url ? (
          <img src={thumbnail_url} alt={name} className={styles.thumbImg} />
        ) : (
          <div className={styles.thumbPlaceholder}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 8C4 6.34315 5.34315 5 7 5H25C26.6569 5 28 6.34315 28 8V24C28 25.6569 26.6569 27 25 27H7C5.34315 27 4 25.6569 4 24V8Z" stroke="var(--border-2)" strokeWidth="1.5"/>
              <path d="M13 11L22 16L13 21V11Z" fill="var(--text-muted)"/>
            </svg>
          </div>
        )}

        {format && (
          <span className={styles.format}>{format}</span>
        )}

        {status === 'processing' && (
          <div className={styles.progressOverlay}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            <span className={styles.progressLabel}>{progress}%</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.topRow}>
          <h3 className={styles.name} title={name}>{name}</h3>
          <StatusBadge status={status} />
        </div>

        {status === 'processing' && step && (
          <p className={styles.step}>{step}</p>
        )}

        <div className={styles.meta}>
          {duration && (
            <span className={styles.metaItem}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 3.5V6L7.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {formatDuration(duration)}
            </span>
          )}
          <span className={styles.metaItem}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 5H11" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 1V3M8 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {formatDate(created_at)}
          </span>
        </div>
      </div>

      <div className={styles.arrow}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </article>
  )
}
