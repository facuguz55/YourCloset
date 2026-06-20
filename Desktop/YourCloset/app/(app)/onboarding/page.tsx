'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

const STYLES = [
  { id: 'streetwear', label: 'Streetwear', emoji: '🧢' },
  { id: 'casual', label: 'Casual', emoji: '👕' },
  { id: 'formal', label: 'Formal', emoji: '👔' },
  { id: 'sport', label: 'Sport', emoji: '🏃' },
  { id: 'bohemio', label: 'Bohemio', emoji: '🌸' },
  { id: 'minimalista', label: 'Minimalista', emoji: '⬜' },
]

const GENDERS = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'femenino', label: 'Femenino' },
  { id: 'unisex', label: 'Unisex / No importa' },
]

const PRICES = [
  { id: 'economico', label: 'Económico', sub: 'Busco buenas opciones a buen precio' },
  { id: 'medio', label: 'Rango medio', sub: 'Precio justo por buena calidad' },
  { id: 'premium', label: 'Premium', sub: 'Calidad antes que precio' },
]

const TOTAL_STEPS = 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [gender, setGender] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

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
        body: JSON.stringify({
          estilos: selectedStyles,
          genero: gender,
          precio_rango: price,
        }),
      })
      router.push('/home')
    } catch {
      setLoading(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Progress bar */}
      <div className="w-full h-1" style={{ backgroundColor: '#F5F5F7' }}>
        <div
          className="h-1 transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: '#0071E3' }}
        />
      </div>

      <div className="flex-1 flex flex-col p-6 pt-8 max-w-md mx-auto w-full">
        {/* Step indicator */}
        <p className="text-[13px] font-medium mb-2" style={{ color: '#6E6E73' }}>
          Paso {step} de {TOTAL_STEPS}
        </p>

        {/* PASO 1: Estilos */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '28px', color: '#1D1D1F' }}>
              ¿Qué estilos te gustan?
            </h1>
            <p className="mb-6" style={{ fontSize: '15px', color: '#6E6E73' }}>
              Seleccioná todos los que querés. Esto define tu feed.
            </p>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {STYLES.map(({ id, label, emoji }) => {
                const selected = selectedStyles.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleStyle(id)}
                    className="relative flex flex-col items-center justify-center gap-2 transition-all duration-150 active:scale-95"
                    style={{
                      minHeight: '100px',
                      borderRadius: '16px',
                      backgroundColor: selected ? '#EBF4FF' : '#F5F5F7',
                      border: `2px solid ${selected ? '#0071E3' : 'transparent'}`,
                    }}
                  >
                    {selected && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#0071E3' }}
                      >
                        <Check size={12} color="white" />
                      </div>
                    )}
                    <span style={{ fontSize: '32px' }}>{emoji}</span>
                    <span
                      className="text-[15px] font-semibold"
                      style={{ color: selected ? '#0071E3' : '#1D1D1F' }}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 2: Género */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '28px', color: '#1D1D1F' }}>
              ¿Qué ropa buscás?
            </h1>
            <p className="mb-6" style={{ fontSize: '15px', color: '#6E6E73' }}>
              Para mostrarte los locales correctos.
            </p>
            <div className="space-y-3">
              {GENDERS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setGender(id)}
                  className="w-full flex items-center justify-between px-5 transition-all duration-150 active:scale-[0.99]"
                  style={{
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: gender === id ? '#EBF4FF' : '#F5F5F7',
                    border: `2px solid ${gender === id ? '#0071E3' : 'transparent'}`,
                  }}
                >
                  <span
                    className="text-[17px] font-medium"
                    style={{ color: gender === id ? '#0071E3' : '#1D1D1F' }}
                  >
                    {label}
                  </span>
                  {gender === id && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#0071E3' }}
                    >
                      <Check size={14} color="white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: Precio */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '28px', color: '#1D1D1F' }}>
              ¿Cuál es tu rango de precio?
            </h1>
            <p className="mb-6" style={{ fontSize: '15px', color: '#6E6E73' }}>
              Podés cambiarlo cuando quieras desde tu perfil.
            </p>
            <div className="space-y-3">
              {PRICES.map(({ id, label, sub }) => (
                <button
                  key={id}
                  onClick={() => setPrice(id)}
                  className="w-full flex items-center justify-between px-5 transition-all duration-150 active:scale-[0.99]"
                  style={{
                    minHeight: '64px',
                    borderRadius: '16px',
                    backgroundColor: price === id ? '#EBF4FF' : '#F5F5F7',
                    border: `2px solid ${price === id ? '#0071E3' : 'transparent'}`,
                    padding: '14px 20px',
                  }}
                >
                  <div className="text-left">
                    <p
                      className="text-[17px] font-medium"
                      style={{ color: price === id ? '#0071E3' : '#1D1D1F' }}
                    >
                      {label}
                    </p>
                    <p className="text-[13px] mt-0.5" style={{ color: '#6E6E73' }}>{sub}</p>
                  </div>
                  {price === id && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-none ml-3"
                      style={{ backgroundColor: '#0071E3' }}
                    >
                      <Check size={14} color="white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-none px-6 font-medium transition-colors"
              style={{ height: '48px', borderRadius: '12px', backgroundColor: '#F5F5F7', color: '#1D1D1F', fontSize: '15px' }}
            >
              Atrás
            </button>
          )}
          <button
            onClick={step < TOTAL_STEPS ? () => setStep((s) => s + 1) : handleFinish}
            disabled={!canProceed() || loading}
            className="flex-1 font-semibold disabled:opacity-50 transition-colors"
            style={{ height: '48px', borderRadius: '12px', backgroundColor: '#0071E3', color: '#FFFFFF', fontSize: '15px' }}
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
