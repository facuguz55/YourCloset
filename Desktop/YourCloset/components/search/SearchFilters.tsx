'use client'

import type { SearchFilters as Filters } from '@/lib/types'

const CATEGORIES = ['campera', 'remera', 'pantalon', 'vestido', 'calzado', 'accesorio']
const STYLES = ['streetwear', 'casual', 'formal', 'sport', 'bohemio', 'minimalista']
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
  { value: 3, label: '3★ o más' },
  { value: 4, label: '4★ o más' },
  { value: 5, label: '5★' },
]
const ORDER_BY = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio ↑' },
  { value: 'price_desc', label: 'Precio ↓' },
  { value: 'rating', label: 'Rating' },
]

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  onApply: () => void
  onClear: () => void
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 capitalize"
      style={{
        minHeight: '32px',
        backgroundColor: active ? '#0071E3' : '#F5F5F7',
        color: active ? '#FFFFFF' : '#1D1D1F',
        border: active ? 'none' : '1px solid #D2D2D7',
      }}
    >
      {label}
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold" style={{ color: '#1D1D1F' }}>{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export default function SearchFilters({ filters, onChange, onApply, onClear }: Props) {
  const toggle = (key: keyof Filters, value: string | number) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value })
  }

  return (
    <div
      className="rounded-t-[24px] bg-white p-5 space-y-5"
      style={{ boxShadow: '0 -2px 16px rgba(0,0,0,0.08)' }}
    >
      <div className="w-10 h-1 rounded-full mx-auto" style={{ backgroundColor: '#D2D2D7' }} />

      <Section title="Categoría">
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            active={filters.category === c}
            onClick={() => toggle('category', c)}
          />
        ))}
      </Section>

      <Section title="Estilo">
        {STYLES.map((s) => (
          <Chip
            key={s}
            label={s}
            active={filters.style === s}
            onClick={() => toggle('style', s)}
          />
        ))}
      </Section>

      <Section title="Género">
        {GENDERS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={filters.gender === value}
            onClick={() => toggle('gender', value)}
          />
        ))}
      </Section>

      <Section title="Precio">
        {PRICES.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={filters.price_range === value}
            onClick={() => toggle('price_range', value)}
          />
        ))}
      </Section>

      <Section title="Rating mínimo">
        {RATINGS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={filters.rating_min === value}
            onClick={() => toggle('rating_min', value)}
          />
        ))}
      </Section>

      <Section title="Ordenar por">
        {ORDER_BY.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={filters.order_by === value}
            onClick={() => toggle('order_by', value)}
          />
        ))}
      </Section>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClear}
          className="flex-1 h-[44px] rounded-[12px] text-[15px] font-medium transition-colors"
          style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}
        >
          Limpiar
        </button>
        <button
          onClick={onApply}
          className="flex-1 h-[44px] rounded-[12px] text-[15px] font-semibold transition-colors"
          style={{ backgroundColor: '#0071E3', color: '#FFFFFF' }}
        >
          Ver resultados
        </button>
      </div>
    </div>
  )
}
