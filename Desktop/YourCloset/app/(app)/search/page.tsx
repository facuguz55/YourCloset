'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search as SearchIcon, X, Frown } from 'lucide-react'
import SearchBar from '@/components/search/SearchBar'
import SearchFilters from '@/components/search/SearchFilters'
import ProductCard, { ProductCardSkeleton } from '@/components/search/ProductCard'
import { useDarkMode } from '@/lib/hooks/useDarkMode'
import type { SearchFilters as Filters, ProductWithStore } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

const EMPTY_FILTERS: Filters = {}

const FILTER_LABELS: Partial<Record<keyof Filters, string>> = {
  category: 'Categoría',
  style: 'Estilo',
  gender: 'Género',
  price_range: 'Precio',
  rating_min: 'Rating',
  order_by: 'Orden',
}

export default function SearchPage() {
  const { dark } = useDarkMode()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [pendingFilters, setPendingFilters] = useState<Filters>(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [results, setResults] = useState<ProductWithStore[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string, f: Filters) => {
    setLoading(true)
    setSearched(true)
    const res = await fetch('/api/search/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, ...f, limit: 30 }),
    })
    const { data } = await res.json()
    setResults(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!query && Object.keys(filters).length === 0) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query, filters), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, filters, search])

  function handleApplyFilters() {
    setFilters(pendingFilters)
    setFiltersOpen(false)
  }

  function handleClearFilters() {
    setPendingFilters(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setFiltersOpen(false)
  }

  function removeFilter(key: keyof Filters) {
    const next = { ...filters }
    delete next[key]
    setFilters(next)
  }

  const activeChips = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => ({ key: k as keyof Filters, value: String(v) }))

  const headerBg = dark ? 'rgba(10,10,12,0.82)' : 'rgba(248,248,252,0.82)'
  const headerBorder = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'
  const headerShadow = dark
    ? 'inset 0 -1px 0 rgba(255,255,255,0.07), 0 4px 32px rgba(0,0,0,0.35)'
    : 'inset 0 -1px 0 rgba(255,255,255,0.60), 0 4px 20px rgba(0,0,0,0.06)'
  const textPrimary = dark ? '#FFFFFF' : '#000000'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const chipBg = dark ? 'rgba(10,132,255,0.18)' : 'rgba(0,113,227,0.12)'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4"
        style={{
          background: headerBg,
          backdropFilter: 'blur(48px) saturate(200%)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%)',
          borderBottom: `0.5px solid ${headerBorder}`,
          boxShadow: headerShadow,
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingBottom: '12px',
        }}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          onFilterToggle={() => {
            setPendingFilters(filters)
            setFiltersOpen(!filtersOpen)
          }}
          filterActive={activeChips.length > 0}
        />
        {/* Chips de filtros activos */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {activeChips.map(({ key, value }) => (
              <button
                key={key}
                onClick={() => removeFilter(key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-none"
                style={{ backgroundColor: chipBg, minHeight: '28px' }}
              >
                <span style={{ fontSize: '12px', color: accentColor, fontWeight: 600 }}>
                  {FILTER_LABELS[key] ?? key}: {value}
                </span>
                <X size={11} strokeWidth={2.5} color={accentColor} />
              </button>
            ))}
            <button
              onClick={handleClearFilters}
              style={{ fontSize: '12px', color: textSecondary, fontWeight: 500, flexShrink: 0 }}
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {!searched && !query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4" style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
              <SearchIcon size={28} strokeWidth={1.5} color={textSecondary} />
            </div>
            <p className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>
              Buscá lo que querés usar
            </p>
            <p className="mt-1" style={{ fontSize: '15px', color: textSecondary }}>
              {`Escribí "campera", "vestido" o cualquier prenda que te guste.`}
            </p>
          </div>
        )}

        {loading && (
          <div className="columns-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mb-3 break-inside-avoid">
                <ProductCardSkeleton dark={dark} />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4" style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
              <Frown size={28} strokeWidth={1.5} color={textSecondary} />
            </div>
            <p className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>
              Sin resultados
            </p>
            <p className="mt-1 max-w-xs" style={{ fontSize: '15px', color: textSecondary }}>
              No encontramos prendas con esos filtros. Probá con otros términos o ampliá la búsqueda.
            </p>
            {activeChips.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-5 py-2.5 rounded-[10px] font-semibold"
                style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: '14px' }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-[13px] mb-3" style={{ color: textSecondary }}>
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </p>
            <div className="columns-2 gap-3">
              {results.map((p) => (
                <div key={p.id} className="mb-3 break-inside-avoid">
                  <ProductCard product={p} dark={dark} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Filters bottom sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            >
              <SearchFilters
                filters={pendingFilters}
                onChange={setPendingFilters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                dark={dark}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
