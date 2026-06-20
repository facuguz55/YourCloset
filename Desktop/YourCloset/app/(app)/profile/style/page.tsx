'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const STYLES = [
  // ── Clásicos ──
  {
    value: 'casual', label: 'Casual', color: '#34C759',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 7l-4-4H8L4 7l3 2V20h10V9l3-2z"/><path d="M8 3c0 2 1.5 3 4 3s4-1 4-3"/></svg>,
  },
  {
    value: 'formal', label: 'Formal', color: '#1D1D1F',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3L6 7l6 2 6-2-3-4"/><line x1="12" y1="9" x2="12" y2="21"/><path d="M9 13l3 2 3-2"/><path d="M5 7v13h14V7"/></svg>,
  },
  {
    value: 'minimalista', label: 'Minimalista', color: '#6E6E73',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="16" x2="11" y2="16"/></svg>,
  },
  {
    value: 'elegante', label: 'Elegante', color: '#AF52DE',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>,
  },
  {
    value: 'clasico', label: 'Clásico', color: '#8E6B3E',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,
  },
  {
    value: 'business', label: 'Business', color: '#0071E3',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  },
  // ── Urbano / Youth ──
  {
    value: 'streetwear', label: 'Streetwear', color: '#FF9500',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3C9 3 6 5 6 8h12c0-3-3-5-6-5z"/><rect x="4" y="8" width="16" height="2" rx="1"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/></svg>,
  },
  {
    value: 'urbano', label: 'Urbano', color: '#FF6B35',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    value: 'y2k', label: 'Y2K', color: '#FF2D78',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M9 9h2l1 2 1-4 1 4 1-2h2"/></svg>,
  },
  {
    value: 'techwear', label: 'Techwear', color: '#2C2C2E',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><circle cx="12" cy="16" r="1.5"/></svg>,
  },
  {
    value: 'grunge', label: 'Grunge', color: '#5E4B3E',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
  },
  {
    value: 'punk', label: 'Punk', color: '#FF3B30',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
  // ── Estilo libre ──
  {
    value: 'bohemio', label: 'Bohemio', color: '#8BC34A',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22c4-4 6-8 6-12a6 6 0 0 0-12 0c0 4 2 8 6 12z"/><circle cx="12" cy="10" r="2"/></svg>,
  },
  {
    value: 'romantico', label: 'Romántico', color: '#FF6B9D',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  },
  {
    value: 'vintage', label: 'Vintage', color: '#D4A017',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  },
  {
    value: 'retro', label: 'Retro', color: '#FF7043',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  },
  {
    value: 'hippie', label: 'Hippie', color: '#7CB342',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  },
  {
    value: 'artsy', label: 'Artsy', color: '#9C27B0',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  },
  // ── Activo ──
  {
    value: 'sport', label: 'Sport', color: '#00B4D8',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93c4.29 4.29 9.85 4.29 14.14 0"/><path d="M4.93 19.07c4.29-4.29 9.85-4.29 14.14 0"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  },
  {
    value: 'athleisure', label: 'Athleisure', color: '#00C9A7',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  },
  // ── Nicho ──
  {
    value: 'preppy', label: 'Preppy', color: '#1565C0',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  },
  {
    value: 'academia', label: 'Academia', color: '#795548',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    value: 'western', label: 'Western', color: '#BF8040',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 17l9-13 9 13H3z"/><path d="M9 17v4M15 17v4M7 21h10"/></svg>,
  },
  {
    value: 'dark', label: 'Dark', color: '#4A0E8F',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  },
  {
    value: 'tropical', label: 'Tropical', color: '#FF6B35',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 8C8 10 5.9 16.17 3.82 22"/><path d="M10.76 3.75C11.47 8.46 8 11 5 13"/><path d="M10.76 3.75C14.29 5.58 15.5 9 17 8"/></svg>,
  },
  {
    value: 'colorido', label: 'Colorido', color: '#FF4081',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
  {
    value: 'loungewear', label: 'Loungewear', color: '#9E9E9E',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h12"/></svg>,
  },
]

const GENDERS = [
  { value: 'femenino', label: 'Mujer' },
  { value: 'masculino', label: 'Hombre' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'sin_preferencia', label: 'Sin preferencia' },
]

const PRICES = [
  { value: 'economico', label: '$ Económico' },
  { value: 'medio', label: '$$ Intermedio' },
  { value: 'premium', label: '$$$ Premium' },
]

export default function StyleSettingsPage() {
  const router = useRouter()
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState('sin_preferencia')
  const [selectedPrice, setSelectedPrice] = useState('medio')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/style-profile')
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.style_profile) {
          setSelectedStyles(data.style_profile.estilos ?? [])
          setSelectedGender(data.style_profile.genero ?? 'sin_preferencia')
          setSelectedPrice(data.style_profile.precio_rango ?? 'medio')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  function toggleStyle(val: string) {
    setSelectedStyles((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    )
    setSaved(false)
  }

  async function handleSave() {
    if (selectedStyles.length === 0) return
    setSaving(true)
    await fetch('/api/user/style-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estilos: selectedStyles, genero: selectedGender, precio_rango: selectedPrice }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.back(), 800)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #e8f0fe 0%, #f5f0ff 50%, #fce8ff 100%)' }}>
        <div className="w-7 h-7 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #e8f0fe 0%, #f5f0ff 50%, #fce8ff 100%)' }}>
      {/* Header glass */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4"
        style={{
          height: '56px',
          paddingTop: 'env(safe-area-inset-top)',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: '0.5px solid rgba(255,255,255,0.7)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset',
        }}
      >
        <button onClick={() => router.back()} style={{ color: '#0071E3', fontSize: '15px', fontWeight: 500 }}>
          ← Volver
        </button>
        <h1 className="flex-1 text-center font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>Tu estilo</h1>
        <div style={{ width: 60 }} />
      </div>

      <div className="px-4 pt-6 pb-10 space-y-6 max-w-lg mx-auto">

        {/* Estilos */}
        <section>
          <p className="mb-3 font-semibold" style={{ fontSize: '13px', color: 'rgba(29,29,31,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Estilos que te gustan
          </p>
          <div className="grid grid-cols-3 gap-3">
            {STYLES.map(({ value, label, icon, color }) => {
              const active = selectedStyles.includes(value)
              const hex = color
              return (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.90 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  onClick={() => toggleStyle(value)}
                  className="flex flex-col items-center gap-2 py-4 rounded-[18px] relative"
                  style={{
                    background: active
                      ? `linear-gradient(135deg, ${hex}28 0%, ${hex}12 100%)`
                      : 'rgba(255,255,255,0.52)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1.5px solid ${active ? hex + '80' : 'rgba(255,255,255,0.8)'}`,
                    boxShadow: active
                      ? `0 2px 12px ${hex}25, 0 1px 0 rgba(255,255,255,0.8) inset`
                      : '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px rgba(0,0,0,0.05)',
                    color: active ? hex : '#8E8E93',
                  }}
                >
                  {icon}
                  <span style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1.2, textAlign: 'center' }}>{label}</span>
                  {active && (
                    <div
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: hex }}
                    >
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3"/>
                      </svg>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Género */}
        <section>
          <p className="mb-3 font-semibold" style={{ fontSize: '13px', color: 'rgba(29,29,31,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Ropa para
          </p>
          <div
            className="flex rounded-[16px] p-1 gap-1"
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(255,255,255,0.8)',
            }}
          >
            {GENDERS.map(({ value, label }) => {
              const active = selectedGender === value
              return (
                <button
                  key={value}
                  onClick={() => { setSelectedGender(value); setSaved(false) }}
                  className="flex-1 py-2 rounded-[12px] text-[13px] font-semibold transition-all"
                  style={{
                    background: active ? 'rgba(0,113,227,1)' : 'transparent',
                    color: active ? '#FFFFFF' : '#6E6E73',
                    boxShadow: active ? '0 2px 8px rgba(0,113,227,0.3)' : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Precio */}
        <section>
          <p className="mb-3 font-semibold" style={{ fontSize: '13px', color: 'rgba(29,29,31,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Rango de precio
          </p>
          <div className="flex gap-3">
            {PRICES.map(({ value, label }) => {
              const active = selectedPrice === value
              return (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { setSelectedPrice(value); setSaved(false) }}
                  className="flex-1 py-4 rounded-[16px] text-[14px] font-semibold"
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, #0071E3 0%, #0055B8 100%)'
                      : 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    color: active ? '#FFFFFF' : '#6E6E73',
                    border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.8)'}`,
                    boxShadow: active ? '0 4px 14px rgba(0,113,227,0.35)' : '0 1px 0 rgba(255,255,255,0.9) inset',
                  }}
                >
                  {label}
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving || selectedStyles.length === 0}
          className="w-full h-[52px] rounded-[16px] font-semibold text-white"
          style={{
            background: saved
              ? 'linear-gradient(135deg, #34C759 0%, #28A745 100%)'
              : 'linear-gradient(135deg, #0071E3 0%, #0055B8 100%)',
            boxShadow: saved
              ? '0 4px 16px rgba(52,199,89,0.4)'
              : '0 4px 16px rgba(0,113,227,0.4)',
            fontSize: '16px',
            opacity: selectedStyles.length === 0 ? 0.5 : 1,
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        >
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </motion.button>
      </div>
    </div>
  )
}
