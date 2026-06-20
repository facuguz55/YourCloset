'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import SearchBar from '@/components/search/SearchBar'
import SearchFilters from '@/components/search/SearchFilters'
import ProductCard, { ProductCardSkeleton } from '@/components/search/ProductCard'
import type { SearchFilters as Filters, ProductWithStore } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

const EMPTY_FILTERS: Filters = {}

export default function SearchPage() {
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

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.70) 100%)',
          backdropFilter: 'blur(48px) saturate(200%) brightness(1.06)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%) brightness(1.06)',
          borderBottom: '0.5px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 12px rgba(0,0,0,0.05)',
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
          filterActive={activeFilterCount > 0}
        />
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span style={{ fontSize: '13px', color: '#6E6E73' }}>
              {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClearFilters}
              style={{ fontSize: '13px', color: '#0071E3', fontWeight: 600 }}
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {!searched && !query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span style={{ fontSize: '48px' }}>🔍</span>
            <p className="mt-4 font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>
              Buscá lo que querés usar
            </p>
            <p className="mt-1" style={{ fontSize: '15px', color: '#6E6E73' }}>
              Escribí "campera", "vestido" o cualquier prenda que te guste.
            </p>
          </div>
        )}

        {loading && (
          <div className="columns-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mb-3 break-inside-avoid">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span style={{ fontSize: '48px' }}>🤷</span>
            <p className="mt-4 font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>
              Sin resultados
            </p>
            <p className="mt-1 max-w-xs" style={{ fontSize: '15px', color: '#6E6E73' }}>
              No encontramos prendas con esos filtros. Probá con otros términos o ampliá la búsqueda.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-[13px] mb-3" style={{ color: '#6E6E73' }}>
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </p>
            <div className="columns-2 gap-3">
              {results.map((p) => (
                <div key={p.id} className="mb-3 break-inside-avoid">
                  <ProductCard product={p} />
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
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
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
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
