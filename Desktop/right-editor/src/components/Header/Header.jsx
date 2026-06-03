import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="var(--cyan-dim)" stroke="var(--cyan)" strokeWidth="1" />
              <path d="M8 9L14 14L8 19" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 9L20 14L14 19" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Right Editor</h1>
            <p className={styles.subtitle}>Video Processing Tool</p>
          </div>
        </div>

        <div className={styles.meta}>
          <span className={styles.version}>v1.0</span>
          <div className={styles.status}>
            <span className={styles.dot} />
            <span>Sistema activo</span>
          </div>
        </div>
      </div>
    </header>
  )
}
