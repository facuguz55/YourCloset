'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

const STYLES = [
  {
    id: 'streetwear',
    label: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=600&fit=crop&q=80',
  },
  {
    id: 'casual',
    label: 'Casual',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=600&fit=crop&q=80',
  },
  {
    id: 'formal',
    label: 'Formal',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=600&fit=crop&q=80',
  },
  {
    id: 'sport',
    label: 'Sport',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=600&fit=crop&q=80',
  },
  {
    id: 'bohemio',
    label: 'Bohemio',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80',
  },
  {
    id: 'minimalista',
    label: 'Minimalista',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=600&fit=crop&q=80',
  },
]

const GENDERS = [
  { id: 'masculino', label: 'Masculino', emoji: '👔' },
  { id: 'femenino', label: 'Femenino', emoji: '👗' },
  { id: 'unisex', label: 'Unisex / No importa', emoji: '✨' },
]

const PRICES = [
  { id: 'economico', label: 'Económico', sub: 'Busco buenas opciones a buen precio', emoji: '💸' },
  { id: 'medio', label: 'Rango medio', sub: 'Precio justo por buena calidad', emoji: '🏷️' },
  { id: 'premium', label: 'Premium', sub: 'Calidad antes que precio', emoji: '💎' },
]

const TOTAL_STEPS = 3

export default function OnboardingPage() {
  const router = useRouter()
  const dark = useDarkMode()
  const [step, setStep] = useState(1)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [gender, setGender] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const bg = dark ? '#000000' : '#F2F2F7'
  const surface = dark ? '#1C1C1E' : '#FFFFFF'
  const surfaceAlt = dark ? '#2C2C2E' : '#F5F5F7'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accent = '#0071E3'
  const accentBg = dark ? 'rgba(0,113,227,0.2)' : '#EBF4FF'
  const progressTrack = dark ? '#2C2C2E' : '#E5E5EA'

  function toggleStyle(id: string) {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function canProceed() {
    if (step === 1) return selectedStyles.length > 0
    if (step === 2) return !!gender
    if (step === 3) return !!price
    return false
  }

  async function handleFinish() {
    if (!canProceed()) return
    setLoading(true)
    try {
      await fetch('/api/user/style-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estilos: selectedStyles, genero: gender, precio_rango: price }),
      })
      router.push('/home')
    } catch {
      setLoading(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg }}>
      {/* Progress bar */}
      <div className="w-full h-1" style={{ backgroundColor: progressTrack }}>
        <div
          className="h-1 transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: accent }}
        />
      </div>

      <div className="flex-1 flex flex-col p-5 pt-7 max-w-md mx-auto w-full">
        {/* Step indicator */}
        <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: accent }}>
          Paso {step} de {TOTAL_STEPS}
        </p>

        {/* PASO 1: Estilos con imágenes */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '26px', color: textPrimary }}>
              ¿Qué estilos te gustan?
            </h1>
            <p className="mb-5" style={{ fontSize: '14px', color: textSecondary }}>
              Elegí todos los que querés. Esto define tu feed.
            </p>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {STYLES.map(({ id, label, image }) => {
                const selected = selectedStyles.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleStyle(id)}
                    className="relative overflow-hidden transition-all duration-150 active:scale-95"
                    style={{
                      aspectRatio: '3/4',
                      borderRadius: '18px',
                      border: `2.5px solid ${selected ? accent : 'transparent'}`,
                      outline: selected ? `3px solid ${accentBg}` : 'none',
                      outlineOffset: '0px',
                    }}
                  >
                    {/* Imagen de fondo */}
                    <Image
                      src={image}
                      alt={label}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover"
                      priority={id === 'streetwear' || id === 'casual'}
                    />

                    {/* Overlay oscuro si está seleccionado */}
                    {selected && (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: 'rgba(0,113,227,0.25)' }}
                      />
                    )}

                    {/* Gradient bottom */}
                    <div
                      className="absolute inset-x-0 bottom-0"
                      style={{
                        height: '55%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                      }}
                    />

                    {/* Label */}
                    <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
                      <span
                        className="font-bold"
                        style={{ fontSize: '15px', color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Check badge */}
                    {selected && (
                      <div
                        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                        style={{ backgroundColor: accent }}
                      >
                        <Check size={13} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 2: Género */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '26px', color: textPrimary }}>
              ¿Qué ropa buscás?
            </h1>
            <p className="mb-6" style={{ fontSize: '14px', color: textSecondary }}>
              Para mostrarte los locales correctos.
            </p>
            <div className="space-y-3">
              {GENDERS.map(({ id, label, emoji }) => {
                const selected = gender === id
                return (
                  <button
                    key={id}
                    onClick={() => setGender(id)}
                    className="w-full flex items-center gap-4 px-5 transition-all duration-150 active:scale-[0.99]"
                    style={{
                      height: '60px',
                      borderRadius: '16px',
                      backgroundColor: selected ? accentBg : surfaceAlt,
                      border: `2px solid ${selected ? accent : 'transparent'}`,
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{emoji}</span>
                    <span
                      className="flex-1 text-left font-medium"
                      style={{ fontSize: '17px', color: selected ? accent : textPrimary }}
                    >
                      {label}
                    </span>
                    {selected && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-none"
                        style={{ backgroundColor: accent }}
                      >
                        <Check size={13} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 3: Precio */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '26px', color: textPrimary }}>
              ¿Cuál es tu rango de precio?
            </h1>
            <p className="mb-6" style={{ fontSize: '14px', color: textSecondary }}>
              Podés cambiarlo cuando quieras desde tu perfil.
            </p>
            <div className="space-y-3">
              {PRICES.map(({ id, label, sub, emoji }) => {
                const selected = price === id
                return (
                  <button
                    key={id}
                    onClick={() => setPrice(id)}
                    className="w-full flex items-center gap-4 px-5 transition-all duration-150 active:scale-[0.99]"
                    style={{
                      minHeight: '72px',
                      borderRadius: '16px',
                      backgroundColor: selected ? accentBg : surfaceAlt,
                      border: `2px solid ${selected ? accent : 'transparent'}`,
                      padding: '16px 20px',
                    }}
                  >
                    <span style={{ fontSize: '26px' }}>{emoji}</span>
                    <div className="flex-1 text-left">
                      <p
                        className="font-semibold"
                        style={{ fontSize: '17px', color: selected ? accent : textPrimary }}
                      >
                        {label}
                      </p>
                      <p className="mt-0.5" style={{ fontSize: '13px', color: textSecondary }}>{sub}</p>
                    </div>
                    {selected && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-none ml-2"
                        style={{ backgroundColor: accent }}
                      >
                        <Check size={13} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex gap-3 pb-safe">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-none px-6 font-medium transition-colors"
              style={{
                height: '50px',
                borderRadius: '14px',
                backgroundColor: surfaceAlt,
                color: textPrimary,
                fontSize: '15px',
              }}
            >
              Atrás
            </button>
          )}
          <button
            onClick={step < TOTAL_STEPS ? () => setStep((s) => s + 1) : handleFinish}
            disabled={!canProceed() || loading}
            className="flex-1 font-semibold disabled:opacity-40 transition-all active:scale-[0.98]"
            style={{
              height: '50px',
              borderRadius: '14px',
              backgroundColor: accent,
              color: '#FFFFFF',
              fontSize: '15px',
            }}
          >
            {loading
              ? 'Guardando...'
              : step < TOTAL_STEPS
              ? 'Continuar'
              : 'Empezar a explorar'}
          </button>
        </div>
      </div>
    </div>
  )
}