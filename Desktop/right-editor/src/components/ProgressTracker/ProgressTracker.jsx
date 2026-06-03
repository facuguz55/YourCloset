import styles from './ProgressTracker.module.css'

// Steps en el orden exacto que N8N los envía, con los % de progreso como umbral
const STEPS = [
  { label: 'Iniciando procesamiento',   minProgress: 5  },
  { label: 'Quitando silencios',        minProgress: 20 },
  { label: 'Transcribiendo con IA',     minProgress: 40 },
  { label: 'Generando subtítulos',      minProgress: 60 },
  { label: 'Agregando logo',            minProgress: 75 },
  { label: 'Subiendo video final',      minProgress: 88 },
]

// Deriva el índice activo desde el progreso numérico (más confiable que el string)
function getStepIndex(progress) {
  if (!progress) return -1
  let idx = -1
  for (let i = 0; i < STEPS.length; i++) {
    if (progress >= STEPS[i].minProgress) idx = i
  }
  return idx
}

export default function ProgressTracker({ progress, step, status }) {
  const currentIdx = status === 'completed' ? STEPS.length : getStepIndex(progress)

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
            <div key={s.label} className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
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
