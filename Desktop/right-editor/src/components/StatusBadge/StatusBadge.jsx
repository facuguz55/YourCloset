import styles from './StatusBadge.module.css'

const STATUS_CONFIG = {
  pending:    { label: 'Pendiente',   cls: 'pending'    },
  uploading:  { label: 'Subiendo',    cls: 'uploading'  },
  processing: { label: 'Procesando',  cls: 'processing' },
  completed:  { label: 'Completado',  cls: 'completed'  },
  error:      { label: 'Error',       cls: 'error'      },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`${styles.badge} ${styles[cfg.cls]}`}>
      {cfg.cls === 'processing' && <span className={styles.spinner} />}
      {cfg.label}
    </span>
  )
}
