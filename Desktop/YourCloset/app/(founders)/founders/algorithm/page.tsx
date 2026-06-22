'use client'

import { useEffect, useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

interface AlgorithmConfig {
  id: string
  weight_style: number
  weight_price: number
  weight_rating: number
  weight_recency: number
  weight_proximity: number
  boost_verified: number
  boost_featured: number
  updated_at: string
}

type WeightKey = keyof Pick<AlgorithmConfig, 'weight_style' | 'weight_price' | 'weight_rating' | 'weight_recency' | 'weight_proximity'>

const WEIGHT_FIELDS: Array<{ key: WeightKey; label: string; description: string }> = [
  { key: 'weight_style', label: 'Estilo', description: 'Coincidencia de estilos del usuario' },
  { key: 'weight_price', label: 'Precio', description: 'Coincidencia de rango de precio' },
  { key: 'weight_rating', label: 'Rating', description: 'Rating del local' },
  { key: 'weight_recency', label: 'Recencia', description: 'Prendas nuevas primero' },
  { key: 'weight_proximity', label: 'Proximidad', description: 'Locales cercanos al usuario' },
]

export default function FoundersAlgorithmPage() {
  const { dark } = useDarkMode()
  const [config, setConfig] = useState<AlgorithmConfig | null>(null)
  const [form, setForm] = useState<Partial<AlgorithmConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const bg2 = dark ? '#2C2C2E' : '#F5F5F7'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const divider = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  useEffect(() => {
    fetch('/api/founders/algorithm')
      .then((r) => r.json())
      .then(({ data }) => {
        setConfig(data)
        setForm(data ?? {})
      })
      .finally(() => setLoading(false))
  }, [])

  const weightSum = WEIGHT_FIELDS.reduce((acc, { key }) => acc + (Number(form[key]) || 0), 0)
  const sumOk = Math.abs(weightSum - 1) < 0.011

  async function handleSave() {
    if (!sumOk) { setError('Los pesos deben sumar exactamente 1.0'); return }
    setSaving(true); setError(null)
    const res = await fetch('/api/founders/algorithm', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const { error: err } = await res.json()
      setError(err)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 rounded-[16px] animate-pulse" style={{ backgroundColor: dark ? '#1C1C1E' : '#FFFFFF' }} />)}</div>
  }

  return (
    <div className="space-y-5">
      <h1 className="font-bold" style={{ fontSize: '22px', color: textPrimary }}>Algoritmo de feed</h1>

      {/* Pesos */}
      <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: divider }}>
          <p className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>Pesos del feed</p>
          <p style={{ fontSize: '13px', color: textSecondary }}>Deben sumar exactamente 1.0</p>
        </div>
        <div className="p-5 space-y-4">
          {WEIGHT_FIELDS.map(({ key, label, description }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="font-medium" style={{ fontSize: '14px', color: textPrimary }}>{label}</p>
                  <p style={{ fontSize: '12px', color: textSecondary }}>{description}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={form[key] ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
                  className="w-20 px-3 text-right outline-none rounded-[8px]"
                  style={{ height: '36px', backgroundColor: bg2, fontSize: '14px', color: textPrimary, fontWeight: 600 }}
                />
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: bg2 }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${((Number(form[key]) || 0) * 100).toFixed(0)}%`, backgroundColor: accentColor }} />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: divider }}>
            <span style={{ fontSize: '13px', color: textSecondary }}>Total actual</span>
            <span className="font-bold" style={{ fontSize: '15px', color: sumOk ? '#34C759' : '#FF3B30' }}>{weightSum.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Boosts */}
      <div className="rounded-[16px] p-5 space-y-4" style={{ backgroundColor: bg }}>
        <p className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>Multiplicadores</p>
        {[
          { key: 'boost_verified' as keyof AlgorithmConfig, label: 'Boost verificados', description: 'Multiplicador para locales verificados' },
          { key: 'boost_featured' as keyof AlgorithmConfig, label: 'Boost destacados', description: 'Multiplicador para prendas destacadas' },
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontSize: '14px', color: textPrimary }}>{label}</p>
              <p style={{ fontSize: '12px', color: textSecondary }}>{description}</p>
            </div>
            <input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={form[key] as number ?? 1}
              onChange={(e) => setForm((f) => ({ ...f, [key]: parseFloat(e.target.value) || 1 }))}
              className="w-20 px-3 text-right outline-none rounded-[8px]"
              style={{ height: '36px', backgroundColor: bg2, fontSize: '14px', color: textPrimary, fontWeight: 600 }}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[12px]" style={{ backgroundColor: 'rgba(255,59,48,0.12)' }}>
          <AlertTriangle size={16} strokeWidth={1.5} color="#FF3B30" />
          <p style={{ fontSize: '13px', color: '#FF3B30' }}>{error}</p>
        </div>
      )}

      {config?.updated_at && (
        <p style={{ fontSize: '12px', color: textSecondary }}>Última actualización: {new Date(config.updated_at).toLocaleString('es-AR')}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !sumOk}
        className="w-full flex items-center justify-center gap-2 h-[48px] rounded-[12px] font-semibold disabled:opacity-50"
        style={{ backgroundColor: saved ? '#34C759' : accentColor, color: '#FFFFFF', fontSize: '15px' }}
      >
        <Save size={18} strokeWidth={1.5} />
        {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  )
}
