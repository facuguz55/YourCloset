import { useRef } from 'react'
import styles from './ElementsPanel.module.css'

const FONTS = ['Outfit', 'DM Sans', 'Arial', 'Impact', 'Montserrat', 'Georgia']

function TypeIcon({ type }) {
  if (type === 'text') return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 3h10M6.5 3v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'logo') return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1" y="3" width="11" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="4" cy="5.5" r="0.9" fill="currentColor"/>
      <path d="M2 10l2.5-2.5 2 2L9.5 6l1.5 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1" y="1" width="11" height="11" rx="1.3" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="4" cy="4" r="1" fill="currentColor"/>
      <path d="M1 9.5l3-3 2.5 2.5L9.5 5l2.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function fmtTime(t) {
  if (t == null) return '∞'
  const s = Math.floor(Number(t))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function ElementsPanel({
  elements,
  selectedId,
  onAddText,
  onAddLogo,
  onAddImage,
  onSelect,
  onUpdate,
  onDelete,
}) {
  const fileRef = useRef(null)
  const sel = elements.find(e => e.id === selectedId)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (file) { onAddImage(file); e.target.value = '' }
  }

  return (
    <div className={styles.panel}>

      {/* Add buttons */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Agregar al video</p>
        <div className={styles.addRow}>
          <button className={styles.addBtn} onClick={onAddText}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M7 3.5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Texto
          </button>
          <button className={styles.addBtn} onClick={onAddLogo}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4 9l2.5-2.5 2 2 3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logo
          </button>
          <button className={styles.addBtn} onClick={() => fileRef.current?.click()}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v8M4 7l3-5 3 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Imagen
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      </div>

      {/* Layers list */}
      {elements.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Capas — {elements.length}</p>
          <div className={styles.layerList}>
            {[...elements].reverse().map(el => (
              <button
                key={el.id}
                className={`${styles.layerRow} ${selectedId === el.id ? styles.layerRowSel : ''}`}
                onClick={() => onSelect(selectedId === el.id ? null : el.id)}
              >
                <span className={styles.layerIcon}><TypeIcon type={el.type} /></span>
                <span className={styles.layerName}>
                  {el.type === 'text'
                    ? (el.content?.slice(0, 22) || 'Texto')
                    : el.type === 'logo' ? 'Logo Right' : 'Imagen'}
                </span>
                <span className={styles.layerTime}>{fmtTime(el.startTime)}</span>
                <button
                  className={styles.layerDelete}
                  onClick={e => { e.stopPropagation(); onDelete(el.id) }}
                  title="Eliminar"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Config panel for selected element */}
      {sel && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Configurar elemento</p>
          <div className={styles.configGrid}>

            {sel.type === 'text' && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Texto</label>
                  <textarea
                    className={styles.textarea}
                    value={sel.content ?? ''}
                    rows={2}
                    placeholder="Escribí acá..."
                    onChange={e => onUpdate(sel.id, { content: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Fuente</label>
                  <select
                    className={styles.select}
                    value={sel.font ?? 'Outfit'}
                    onChange={e => onUpdate(sel.id, { font: e.target.value })}
                  >
                    {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                </div>

                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.label}>Tamaño: {Math.round((sel.fontSize ?? 0.06) * 100)}%</label>
                    <input
                      type="range" min="2" max="16" step="1"
                      className={styles.range}
                      value={Math.round((sel.fontSize ?? 0.06) * 100)}
                      onChange={e => onUpdate(sel.id, { fontSize: Number(e.target.value) / 100 })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Color</label>
                    <input
                      type="color"
                      className={styles.colorPicker}
                      value={sel.color ?? '#ffffff'}
                      onChange={e => onUpdate(sel.id, { color: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.label}>Fondo</label>
                    <div className={styles.inlineRow}>
                      <button
                        className={`${styles.toggleBtn} ${sel.bgColor ? styles.toggleBtnOn : ''}`}
                        onClick={() => onUpdate(sel.id, { bgColor: sel.bgColor ? null : '#000000' })}
                      >
                        {sel.bgColor ? 'Activo' : 'No'}
                      </button>
                      {sel.bgColor && (
                        <input
                          type="color"
                          className={styles.colorPicker}
                          value={sel.bgColor}
                          onChange={e => onUpdate(sel.id, { bgColor: e.target.value })}
                        />
                      )}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Negrita</label>
                    <button
                      className={`${styles.toggleBtn} ${sel.bold ? styles.toggleBtnOn : ''}`}
                      onClick={() => onUpdate(sel.id, { bold: !sel.bold })}
                    >
                      {sel.bold ? 'Sí' : 'No'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {(sel.type === 'logo' || sel.type === 'image') && (
              <div className={styles.field}>
                <label className={styles.label}>Tamaño: {Math.round((sel.width ?? 0.15) * 100)}% del ancho</label>
                <input
                  type="range" min="5" max="60" step="1"
                  className={styles.range}
                  value={Math.round((sel.width ?? 0.15) * 100)}
                  onChange={e => onUpdate(sel.id, { width: Number(e.target.value) / 100 })}
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Opacidad: {Math.round((sel.opacity ?? 1) * 100)}%</label>
              <input
                type="range" min="10" max="100" step="5"
                className={styles.range}
                value={Math.round((sel.opacity ?? 1) * 100)}
                onChange={e => onUpdate(sel.id, { opacity: Number(e.target.value) / 100 })}
              />
            </div>

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>Aparece (seg)</label>
                <input
                  type="number" min="0" step="0.5"
                  className={styles.input}
                  value={sel.startTime ?? ''}
                  placeholder="Siempre"
                  onChange={e => onUpdate(sel.id, {
                    startTime: e.target.value === '' ? null : Number(e.target.value),
                  })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Desaparece (seg)</label>
                <input
                  type="number" min="0" step="0.5"
                  className={styles.input}
                  value={sel.endTime ?? ''}
                  placeholder="Siempre"
                  onChange={e => onUpdate(sel.id, {
                    endTime: e.target.value === '' ? null : Number(e.target.value),
                  })}
                />
              </div>
            </div>

            <button
              className={styles.deleteBtn}
              onClick={() => { onDelete(sel.id); onSelect(null) }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Eliminar elemento
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
