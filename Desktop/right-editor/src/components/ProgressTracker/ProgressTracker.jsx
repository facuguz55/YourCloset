import styles from './ProgressTracker.module.css'

const STEPS = [
  { key: 'uploading',    label: 'Subiendo'             },
  { key: 'transcribing', label: 'Transcribiendo'        },
  { key: 'silence',      label: 'Quitando silencios'    },
  { key: 'subtitles',    label: 'Renderizando subtítulos' },
  { key: 'logo',         label: 'Agregando logo'        },
  { key: 'finalizing',   label: 'Finalizando'           },
]

function getStepIndex(step) {
  const map = {
    uploading: 0, transcribing: 1, silence: 2,
    subtitles: 3, logo: 4, finalizing: 5,
  }
  if (!step) return 0
  const lower = step.toLowerCase()
  for (const [key, idx] of Object.entries(map)) {
    if (lower.includes(key)) return idx
  }
  return 0
}

export default function ProgressTracker({ progress, step, status }) {
  const currentIdx = status === 'completed' ? STEPS.length : getStepIndex(step)

  return (
    <div className={styles.tracker}>
      <div className={styles.header}>
        <span className={styles.stepLabel}>
          {status === 'completed' ? 'Procesamiento completo' : (step || 'Procesando...')}
        </span>
        <span className={styles.pct}>{progress}%</span>
      </div>

      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.steps}>
        {STEPS.map((s, i) => {
          const done    = i < currentIdx
          const active  = i === currentIdx && status !== 'completed'
          return (
            <div key={s.key} className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
              <div className={styles.dot}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : active ? (
                  <span className={styles.spinner} />
                ) : null}
              </div>
              <span className={styles.stepName}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
