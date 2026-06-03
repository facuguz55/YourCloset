import logo from '../../assets/logo.png'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src={logo} alt="Right Botines" className={styles.logo} />
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
