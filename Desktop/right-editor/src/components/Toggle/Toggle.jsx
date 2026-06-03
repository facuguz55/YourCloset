import styles from './Toggle.module.css'

export default function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.left}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.desc}>{description}</span>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        type="button"
        className={`${styles.track} ${checked ? styles.on : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
      >
        <span className={styles.thumb} />
      </button>
    </label>
  )
}
