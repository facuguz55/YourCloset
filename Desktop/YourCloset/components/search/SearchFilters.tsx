'use client'

import type { SearchFilters as Filters } from '@/lib/types'

const CATEGORIES = ['campera', 'remera', 'pantalon', 'vestido', 'calzado', 'accesorio']
const STYLES = ['streetwear', 'casual', 'formal', 'sport', 'bohemio', 'minimalista', 'y2k', 'vintage', 'coquette']
const GENDERS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'unisex', label: 'Unisex' },
]
const PRICES = [
  { value: 'economico', label: 'Económico' },
  { value: 'medio', label: 'Medio' },
  { value: 'premium', label: 'Premium' },
]
const RATINGS = [
  { value: 3, label: '3+ estrellas' },
  { value: 4, label: '4+ estrellas' },
  { value: 5, label: '5 estrellas' },
]
const ORDER_BY = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio asc.' },
  { value: 'price_desc', label: 'Precio desc.' },
  { value: 'rating', label: 'Rating' },
]

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  onApply: () => void
  onClear: () => void
  dark?: boolean
}

function Chip({ label, active, onClick, dark = false }: { label: string; active: boolean; onClick: () => void; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 capitalize"
      style={{
        minHeight: '32px',
        backgroundColor: active ? (dark ? '#0A84FF' : '#0071E3') : (dark ? '#2C2C2E' : '#F5F5F7'),
        color: active ? '#FFFFFF' : (dark ? '#AEAEB2' : '#1D1D1F'),
        border: active ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#D2D2D7'}`,
      }}
    >
      {label}
    </button>
  )
}

function Section({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold" style={{ color: dark ? '#AEAEB2' : '#1D1D1F' }}>{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export default function SearchFilters({ filters, onChange, onApply, onClear, dark = false }: Props) {
  const toggle = (key: keyof Filters, value: string | number) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value })
  }

  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const handle = dark ? 'rgba(255,255,255,0.15)' : '#D2D2D7'

  return (
    <div
      className="rounded-t-[24px] p-5 space-y-5"
      style={{ backgroundColor: bg, boxShadow: '0 -2px 16px rgba(0,0,0,0.18)' }}
    >
      <div className="w-10 h-1 rounded-full mx-auto" style={{ backgroundColor: handle }} />

      <Section title="Categoría" dark={dark}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={filters.category === c} onClick={() => toggle('category', c)} dark={dark} />
        ))}
      </Section>

      <Section title="Estilo" dark={dark}>
        {STYLES.map((s) => (
          <Chip key={s} label={s} active={filters.style === s} onClick={() => toggle('style', s)} dark={dark} />
        ))}
      </Section>

      <Section title="Género" dark={dark}>
        {GENDERS.map(({ value, label }) => (
          <Chip key={value} label={label} active={filters.gender === value} onClick={() => toggle('gender', value)} dark={dark} />
        ))}
      </Section>

      <Section title="Precio" dark={dark}>
        {PRICES.map(({ value, label }) => (
          <Chip key={value} label={label} active={filters.price_range === value} onClick={() => toggle('price_range', value)} dark={dark} />
        ))}
      </Section>

      <Section title="Rating mínimo" dark={dark}>
        {RATINGS.map(({ value, label }) => (
          <Chip key={value} label={label} active={filters.rating_min === value} onClick={() => toggle('rating_min', value)} dark={dark} />
        ))}
      </Section>

      <Section title="Ordenar por" dark={dark}>
        {ORDER_BY.map(({ value, label }) => (
          <Chip key={value} label={label} active={filters.order_by === value} onClick={() => toggle('order_by', value)} dark={dark} />
        ))}
      </Section>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClear}
          className="flex-1 h-[44px] rounded-[12px] text-[15px] font-medium"
          style={{ backgroundColor: dark ? '#2C2C2E' : '#F5F5F7', color: dark ? '#AEAEB2' : '#1D1D1F' }}
        >
          Limpiar
        </button>
        <button
          onClick={onApply}
          className="flex-1 h-[44px] rounded-[12px] text-[15px] font-semibold"
          style={{ backgroundColor: dark ? '#0A84FF' : '#0071E3', color: '#FFFFFF' }}
        >
          Ver resultados
        </button>
      </div>
    </div>
  )
}
