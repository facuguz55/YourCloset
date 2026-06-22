'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

const STYLES = [
  { id: 'streetwear', label: 'Streetwear', image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=600&fit=crop&q=80' },
  { id: 'casual', label: 'Casual', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=600&fit=crop&q=80' },
  { id: 'formal', label: 'Formal', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=600&fit=crop&q=80' },
  { id: 'sport', label: 'Sport', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=600&fit=crop&q=80' },
  { id: 'y2k', label: 'Y2K', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&q=80' },
  { id: 'minimalista', label: 'Minimalista', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=600&fit=crop&q=80' },
  { id: 'bohemio', label: 'Bohemio', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80' },
  { id: 'smart_casual', label: 'Smart Casual', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=600&fit=crop&q=80' },
  { id: 'drip', label: 'Drip', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&h=600&fit=crop&q=80' },
  { id: 'techwear', label: 'Techwear', image: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=400&h=600&fit=crop&q=80' },
  { id: 'vintage', label: 'Vintage', image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&h=600&fit=crop&q=80' },
  { id: 'coquette', label: 'Coquette', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop&q=80' },
  { id: 'academia', label: 'Academia', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&q=80' },
  { id: 'outdoors', label: 'Outdoors', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=600&fit=crop&q=80' },
]

const GENDERS = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'femenino', label: 'Femenino' },
  { id: 'unisex', label: 'Unisex' },
  { id: 'sin_preferencia', label: 'Sin preferencia' },
]

const PRICES = [
  { id: 'economico', label: 'Economico', sub: 'Busco buenas opciones a buen precio' },
  { id: 'medio', label: 'Rango medio', sub: 'Precio justo por buena calidad' },
  { id: 'premium', label: 'Premium', sub: 'Calidad antes que precio' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'No importa']
const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const dark = useDarkMode()
  const [step, setStep] = useState(1)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [gender, setGender] = useState('')
  const [price, setPrice] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const bg = dark ? '#000000' : '#F2F2F7'
  const surfaceAlt = dark ? '#2C2C2E' : '#F5F5F7'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accent = dark ? '#0A84FF' : '#0071E3'
  const accentBg = dark ? 'rgba(10,132,255,0.2)' : '#EBF4FF'
  const progressTrack = dark ? '#2C2C2E' : '#E5E5EA'

  function toggleStyle(id: string) {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function toggleSize(s: string) {
    if (s === 'No importa') { setSelectedSizes(['No importa']); return }
    setSelectedSizes((prev) => {
      const without = prev.filter((x) => x !== 'No importa')
      return without.includes(s) ? without.filter((x) => x !== s) : [...without, s]
    })
  }

  function canProceed() {
    if (step === 1) return selectedStyles.length >= 2
    if (step === 2) return !!gender
    if (step === 3) return !!price
    if (step === 4) return selectedSizes.length > 0
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
          talle: selectedSizes.includes('No importa') ? null : selectedSizes[0],
        }),
      })
      router.push('/home')
    } catch {
      setLoading(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg }}>
      <div className="w-full h-1" style={{ backgroundColor: progressTrack }}>
        <div className="h-1 transition-all duration-500 ease-out" style={{ width: `${progress}%`, backgroundColor: accent }} />
      </div>
      <div className="flex-1 flex flex-col p-5 pt-7 max-w-md mx-auto w-full">
        <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: accent }}>
          Paso {step} de {TOTAL_STEPS}
        </p>

        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '26px', color: textPrimary }}>Que estilos te gustan?</h1>
            <p className="mb-4" style={{ fontSize: '14px', color: textSecondary }}>Selecciona al menos 2. Esto define tu feed.</p>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {STYLES.map(({ id, label, image }) => {
                const selected = selectedStyles.includes(id)
                return (
                  <button key={id} onClick={() => toggleStyle(id)} className="relative overflow-hidden transition-all duration-150 active:scale-95" style={{ aspectRatio: '3/4', borderRadius: '18px', border: `2.5px solid ${selected ? accent : 'transparent'}` }}>
                    <Image src={image} alt={label} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
                    {selected && <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,113,227,0.25)' }} />}
                    <div className="absolute inset-x-0 bottom-0" style={{ height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }} />
                    <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
                      <span className="font-bold" style={{ fontSize: '14px', color: '#FFFFFF' }}>{label}</span>
                    </div>
                    {selected && (
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}>
                        <Check size={12} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '26px', color: textPrimary }}>Que ropa buscas?</h1>
            <p className="mb-6" style={{ fontSize: '14px', color: textSecondary }}>Para mostrarte los locales correctos.</p>
            <div className="space-y-3">
              {GENDERS.map(({ id, label }) => {
                const selected = gender === id
                return (
                  <button key={id} onClick={() => setGender(id)} className="w-full flex items-center justify-between px-5 transition-all active:scale-[0.99]" style={{ minHeight: '56px', borderRadius: '16px', backgroundColor: selected ? accentBg : surfaceAlt, border: `2px solid ${selected ? accent : 'transparent'}` }}>
                    <span className="font-medium" style={{ fontSize: '17px', color: selected ? accent : textPrimary }}>{label}</span>
                    {selected && <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}><Check size={13} color="white" strokeWidth={3} /></div>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '26px', color: textPrimary }}>Cual es tu rango de precio?</h1>
            <p className="mb-6" style={{ fontSize: '14px', color: textSecondary }}>Podes cambiarlo desde tu perfil cuando quieras.</p>
            <div className="space-y-3">
              {PRICES.map(({ id, label, sub }) => {
                const selected = price === id
                return (
                  <button key={id} onClick={() => setPrice(id)} className="w-full flex items-center justify-between transition-all active:scale-[0.99]" style={{ minHeight: '72px', borderRadius: '16px', backgroundColor: selected ? accentBg : surfaceAlt, border: `2px solid ${selected ? accent : 'transparent'}`, padding: '16px 20px' }}>
                    <div className="text-left">
                      <p className="font-semibold" style={{ fontSize: '17px', color: selected ? accent : textPrimary }}>{label}</p>
                      <p className="mt-0.5" style={{ fontSize: '13px', color: textSecondary }}>{sub}</p>
                    </div>
                    {selected && <div className="w-6 h-6 rounded-full flex items-center justify-center flex-none ml-2" style={{ backgroundColor: accent }}><Check size={13} color="white" strokeWidth={3} /></div>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <h1 className="font-bold mb-1" style={{ fontSize: '26px', color: textPrimary }}>Cual es tu talle?</h1>
            <p className="mb-6" style={{ fontSize: '14px', color: textSecondary }}>Para mostrarte prendas disponibles en tu talle.</p>
            <div className="flex flex-wrap gap-3">
              {SIZES.map((size) => {
                const selected = selectedSizes.includes(size)
                return (
                  <button key={size} onClick={() => toggleSize(size)} className="font-semibold transition-all active:scale-95" style={{ minWidth: '64px', minHeight: '48px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '12px', backgroundColor: selected ? accent : surfaceAlt, color: selected ? '#FFFFFF' : textPrimary, fontSize: '15px' }}>
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-6 pb-4">
          <button onClick={step < TOTAL_STEPS ? () => setStep((s) => s + 1) : handleFinish} disabled={!canProceed() || loading} className="w-full font-semibold disabled:opacity-40 transition-all active:scale-[0.98]" style={{ height: '50px', borderRadius: '14px', backgroundColor: accent, color: '#FFFFFF', fontSize: '15px' }}>
            {loading ? 'Guardando...' : step < TOTAL_STEPS ? 'Continuar' : 'Empezar a explorar'}
          </button>
        </div>
      </div>
    </div>
  )
}
