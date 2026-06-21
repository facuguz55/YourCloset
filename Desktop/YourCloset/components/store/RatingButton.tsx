'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

const POSITIVE_TAGS: { key: string; label: string }[] = [
  { key: 'buena_atencion', label: 'Buena atención' },
  { key: 'gran_variedad', label: 'Gran variedad' },
  { key: 'buen_precio', label: 'Buen precio' },
  { key: 'estilo_unico', label: 'Estilo único' },
  { key: 'facil_ubicar', label: 'Fácil de ubicar' },
]

const NEGATIVE_TAGS: { key: string; label: string }[] = [
  { key: 'mala_atencion', label: 'Mala atención' },
  { key: 'poco_stock', label: 'Poco stock' },
  { key: 'precios_altos', label: 'Precios altos' },
  { key: 'no_era_lo_que_mostraban', label: 'No era lo que mostraban' },
]

interface Props {
  slug: string
}

export default function RatingButton({ slug }: Props) {
  const dark = useDarkMode()
  const [open, setOpen] = useState(false)
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [positiveTags, setPositiveTags] = useState<string[]>([])
  const [negativeTags, setNegativeTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sheetBg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const surface = dark ? '#2C2C2E' : '#F5F5F7'
  const handleColor = dark ? '#3A3A3C' : '#D2D2D7'
  const closeIconColor = dark ? '#636366' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const errorColor = dark ? '#FF453A' : '#FF3B30'
  const successColor = dark ? '#30D158' : '#34C759'
  const sheetShadow = dark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.12), 0 -8px 48px rgba(0,0,0,0.7)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.85), 0 -4px 32px rgba(0,0,0,0.14)'

  function toggleTag(key: string, type: 'positive' | 'negative') {
    if (type === 'positive') {
      setPositiveTags((prev) =>
        prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
      )
    } else {
      setNegativeTags((prev) =>
        prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
      )
    }
  }

  function reset() {
    setStars(0)
    setHovered(0)
    setPositiveTags([])
    setNegativeTags([])
    setError(null)
    setDone(false)
  }

  function handleClose() {
    setOpen(false)
    setTimeout(reset, 350)
  }

  async function handleSubmit() {
    if (stars === 0) {
      setError('Seleccioná al menos una estrella')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stores/${slug}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars,
          positive_tags: positiveTags,
          negative_tags: negativeTags,
        }),
      })
      if (res.status === 401) {
        setError('Tenés que iniciar sesión para valorar')
        return
      }
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Error al enviar la valoración')
        return
      }
      setDone(true)
    } catch {
      setError('No se pudo conectar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-[12px] font-semibold active:scale-[0.98] transition-transform"
        style={{ backgroundColor: surface, color: textPrimary, fontSize: '15px' }}
      >
        <Star size={17} style={{ color: '#FF9500' }} />
        Valorar este local
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
              style={{
                backgroundColor: sheetBg,
                borderRadius: '24px 24px 0 0',
                boxShadow: sheetShadow,
                maxHeight: '90vh',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80) handleClose()
              }}
            >
              <div className="overflow-y-auto" style={{ maxHeight: '90vh' }}>
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full" style={{ backgroundColor: handleColor }} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-2 pb-4">
                  <h2 className="font-bold" style={{ fontSize: '20px', color: textPrimary }}>
                    Valorar local
                  </h2>
                  <button
                    onClick={handleClose}
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ backgroundColor: surface }}
                  >
                    <X size={16} style={{ color: closeIconColor }} />
                  </button>
                </div>

                <div className="px-5 pb-8 space-y-6">
                  {done ? (
                    /* Estado de éxito */
                    <div className="flex flex-col items-center py-8 gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${successColor}22` }}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={successColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-bold" style={{ fontSize: '18px', color: textPrimary }}>¡Gracias por tu valoración!</p>
                        <p className="mt-1" style={{ fontSize: '14px', color: textSecondary }}>Tu opinión ayuda a otros compradores.</p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="mt-2 py-3 px-8 rounded-[12px] font-semibold"
                        style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: '15px' }}
                      >
                        Cerrar
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Estrellas */}
                      <div className="flex flex-col items-center gap-3">
                        <p className="font-medium" style={{ fontSize: '15px', color: textSecondary }}>
                          ¿Cómo calificarías tu experiencia?
                        </p>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button
                              key={i}
                              onMouseEnter={() => setHovered(i)}
                              onMouseLeave={() => setHovered(0)}
                              onClick={() => setStars(i)}
                              className="active:scale-90 transition-transform"
                            >
                              <Star
                                size={40}
                                fill={i <= (hovered || stars) ? '#FF9500' : 'none'}
                                style={{ color: '#FF9500', transition: 'fill 0.1s' }}
                              />
                            </button>
                          ))}
                        </div>
                        {stars > 0 && (
                          <p style={{ fontSize: '13px', color: textSecondary }}>
                            {['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][stars]}
                          </p>
                        )}
                      </div>

                      {/* Tags positivos */}
                      {stars >= 3 && (
                        <div className="space-y-2">
                          <p className="font-medium" style={{ fontSize: '14px', color: textSecondary }}>
                            ¿Qué fue lo mejor? (opcional)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {POSITIVE_TAGS.map((t) => {
                              const active = positiveTags.includes(t.key)
                              return (
                                <button
                                  key={t.key}
                                  onClick={() => toggleTag(t.key, 'positive')}
                                  className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors active:scale-95"
                                  style={{
                                    backgroundColor: active ? accentColor : surface,
                                    color: active ? '#FFFFFF' : textSecondary,
                                  }}
                                >
                                  {t.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tags negativos */}
                      {stars > 0 && stars <= 2 && (
                        <div className="space-y-2">
                          <p className="font-medium" style={{ fontSize: '14px', color: textSecondary }}>
                            ¿Qué falló? (opcional)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {NEGATIVE_TAGS.map((t) => {
                              const active = negativeTags.includes(t.key)
                              return (
                                <button
                                  key={t.key}
                                  onClick={() => toggleTag(t.key, 'negative')}
                                  className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors active:scale-95"
                                  style={{
                                    backgroundColor: active ? errorColor : surface,
                                    color: active ? '#FFFFFF' : textSecondary,
                                  }}
                                >
                                  {t.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {error && (
                        <p className="text-center text-[13px]" style={{ color: errorColor }}>
                          {error}
                        </p>
                      )}

                      {/* Submit */}
                      <button
                        onClick={handleSubmit}
                        disabled={loading || stars === 0}
                        className="w-full py-3.5 rounded-[14px] font-semibold transition-opacity active:scale-[0.98]"
                        style={{
                          backgroundColor: stars === 0 ? surface : accentColor,
                          color: stars === 0 ? textSecondary : '#FFFFFF',
                          fontSize: '16px',
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? 'Enviando...' : 'Enviar valoración'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
