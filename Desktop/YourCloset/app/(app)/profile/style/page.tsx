'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const STYLES = [
  { value: 'streetwear', label: 'Streetwear', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3C9 3 6 5 6 8h12c0-3-3-5-6-5z"/><rect x="4" y="8" width="16" height="2" rx="1"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/></svg>
  )},
  { value: 'casual', label: 'Casual', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 7l-4-4H8L4 7l3 2V20h10V9l3-2z"/><path d="M8 3c0 2 1.5 3 4 3s4-1 4-3"/></svg>
  )},
  { value: 'formal', label: 'Formal', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3L6 7l6 2 6-2-3-4"/><line x1="12" y1="9" x2="12" y2="21"/><path d="M9 13l3 2 3-2"/><path d="M5 7v13h14V7"/></svg>
  )},
  { value: 'sport', label: 'Sport', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  )},
  { value: 'bohemio', label: 'Bohemio', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22c4-4 6-8 6-12a6 6 0 0 0-12 0c0 4 2 8 6 12z"/><circle cx="12" cy="10" r="2"/></svg>
  )},
  { value: 'minimalista', label: 'Minimalista', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="16" x2="11" y2="16"/></svg>
  )},
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
            {STYLES.map(({ value, label, icon }) => {
              const active = selectedStyles.includes(value)
              return (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  onClick={() => toggleStyle(value)}
                  className="flex flex-col items-center gap-2 py-4 rounded-[18px] relative"
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, rgba(0,113,227,0.18) 0%, rgba(0,113,227,0.08) 100%)'
                      : 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1.5px solid ${active ? 'rgba(0,113,227,0.5)' : 'rgba(255,255,255,0.8)'}`,
                    boxShadow: active
                      ? '0 2px 12px rgba(0,113,227,0.15), 0 1px 0 rgba(255,255,255,0.8) inset'
                      : '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px rgba(0,0,0,0.06)',
                    color: active ? '#0071E3' : '#6E6E73',
                  }}
                >
                  {icon}
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{label}</span>
                  {active && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#0071E3' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
