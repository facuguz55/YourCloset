'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Shirt, Search, TrendingUp, ChevronRight } from 'lucide-react'
import ProductCard, { ProductCardSkeleton } from '@/components/search/ProductCard'
import { useDarkMode } from '@/lib/hooks/useDarkMode'
import type { ProductWithStore } from '@/lib/types'

const LIMIT = 20

// Sección horizontal de prendas trending
function TrendingSection({ dark }: { dark: boolean }) {
  const [items, setItems] = useState<ProductWithStore[]>([])
  const [loading, setLoading] = useState(true)
  const textPrimary = dark ? '#FFFFFF' : '#000000'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const skeletonBg = dark ? '#2C2C2E' : '#E5E5EA'

  useEffect(() => {
    fetch('/api/user/trending')
      .then((r) => r.json())
      .then(({ data }) => { setItems(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <div className="pt-5">
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} strokeWidth={1.5} color={accentColor} />
          <h2 className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>Esta semana</h2>
        </div>
        <Link href="/search" className="flex items-center gap-1">
          <span style={{ fontSize: '13px', color: accentColor, fontWeight: 600 }}>Ver todo</span>
          <ChevronRight size={14} strokeWidth={2} color={accentColor} />
        </Link>
      </div>
      <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-3 px-4" style={{ width: 'max-content' }}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-none" style={{ width: 130 }}>
                  <div className="rounded-[14px] animate-pulse" style={{ width: 130, height: 173, backgroundColor: skeletonBg }} />
                  <div className="h-2.5 rounded-full animate-pulse mt-2 w-3/4" style={{ backgroundColor: skeletonBg }} />
                </div>
              ))
            : items.map((p) => {
                const img = p.image_urls?.[0]
                return (
                  <Link
                    key={p.id}
                    href={`/store/${p.store.slug}`}
                    className="flex-none active:scale-[0.97] transition-transform duration-150"
                    style={{ width: 130 }}
                  >
                    <div className="rounded-[14px] overflow-hidden" style={{ width: 130, height: 173, backgroundColor: skeletonBg, position: 'relative' }}>
                      {img && (
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          sizes="130px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="truncate mt-1.5 font-medium" style={{ fontSize: '12px', color: textPrimary }}>{p.name}</p>
                    <p className="truncate" style={{ fontSize: '11px', color: textSecondary }}>{p.store.name}</p>
                  </Link>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { dark } = useDarkMode()
  const [products, setProducts] = useState<ProductWithStore[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const fetchFeed = useCallback(async (currentCursor: string | null) => {
    const params = new URLSearchParams({ limit: String(LIMIT) })
    if (currentCursor) params.set('cursor', currentCursor)
    const res = await fetch(`/api/user/feed?${params}`)
    if (!res.ok) return
    const { data, meta } = await res.json()
    setProducts((prev) => currentCursor ? [...prev, ...data] : data)
    setCursor(meta?.next_cursor ?? null)
    setHasMore(!!meta?.next_cursor)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch('/api/user/style-profile')
      .then((r) => r.json())
      .then(({ data }) => {
        if (data && data.onboarding_done === false) {
          window.location.href = '/onboarding'
          return
        }
        fetchFeed(null)
      })
      .catch(() => fetchFeed(null))
  }, [fetchFeed])

  useEffect(() => {
    if (!hasMore || loading) return
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && cursor) fetchFeed(cursor) },
      { rootMargin: '200px' }
    )
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [cursor, hasMore, loading, fetchFeed])

  const headerBg = dark ? 'rgba(10, 10, 12, 0.82)' : 'rgba(248, 248, 252, 0.82)'
  const headerBorder = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'
  const headerShadow = dark
    ? 'inset 0 -1px 0 rgba(255,255,255,0.07), 0 4px 32px rgba(0,0,0,0.35)'
    : 'inset 0 -1px 0 rgba(255,255,255,0.60), 0 4px 20px rgba(0,0,0,0.06)'
  const searchBg = dark ? '#1C1C1E' : '#FFFFFF'
  const searchBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const searchColor = dark ? '#636366' : '#8E8E93'
  const titleColor = dark ? '#FFFFFF' : '#000000'
  const bodyTextPrimary = dark ? '#FFFFFF' : '#000000'
  const bodyTextSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const divider = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div style={{ minHeight: '100vh' }}>
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
        <div className="flex items-center justify-between mb-3 max-w-2xl mx-auto">
          <h1
            className="font-bold"
            style={{ fontSize: '28px', color: titleColor, letterSpacing: '-0.5px' }}
          >
            YourCloset
          </h1>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2.5 max-w-2xl mx-auto"
          style={{
            height: '36px',
            borderRadius: '10px',
            backgroundColor: searchBg,
            border: `0.5px solid ${searchBorder}`,
            padding: '0 12px',
          }}
        >
          <Search size={14} strokeWidth={2.5} color={searchColor} />
          <span style={{ fontSize: '15px', color: searchColor }}>Buscá camperas, vestidos...</span>
        </Link>
      </div>

      {/* Contenido */}
      <div className="max-w-2xl mx-auto">
        {loading && products.length === 0 ? (
          <>
            <TrendingSection dark={dark} />
            <div className="pt-5 px-4">
              <div className="h-px mb-4" style={{ backgroundColor: divider }} />
              <div className="columns-2 gap-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="mb-2.5 break-inside-avoid">
                    <ProductCardSkeleton dark={dark} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : !loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4" style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
              <Shirt size={28} strokeWidth={1.5} color={bodyTextSecondary} />
            </div>
            <p className="font-semibold" style={{ fontSize: '17px', color: bodyTextPrimary }}>
              Tu feed está vacío
            </p>
            <p className="mt-1" style={{ fontSize: '15px', color: bodyTextSecondary }}>
              Todavía no hay prendas que coincidan con tu estilo. ¡Volvé pronto!
            </p>
            <Link
              href="/search"
              className="mt-6 px-6 py-3 rounded-[12px] font-semibold"
              style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: '15px' }}
            >
              Explorar todo
            </Link>
          </div>
        ) : (
          <>
            <TrendingSection dark={dark} />
            <div className="pt-5 px-4">
              <div className="h-px mb-4" style={{ backgroundColor: divider }} />
              <p className="font-semibold mb-3" style={{ fontSize: '15px', color: bodyTextSecondary }}>Para vos</p>
              <div className="columns-2 gap-2.5">
                {products.map((p) => (
                  <div key={p.id} className="mb-2.5 break-inside-avoid">
                    <ProductCard product={p} dark={dark} />
                  </div>
                ))}
              </div>
              {loading && (
                <div className="columns-2 gap-2.5 mt-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="mb-2.5 break-inside-avoid">
                      <ProductCardSkeleton dark={dark} />
                    </div>
                  ))}
                </div>
              )}
              <div ref={sentinelRef} className="h-4" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
