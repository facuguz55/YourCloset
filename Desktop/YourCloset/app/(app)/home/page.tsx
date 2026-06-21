'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import ProductCard, { ProductCardSkeleton } from '@/components/search/ProductCard'
import { useDarkMode } from '@/lib/hooks/useDarkMode'
import type { ProductWithStore } from '@/lib/types'

const LIMIT = 20

export default function HomePage() {
  const dark = useDarkMode()
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

  // iOS 26 Liquid Glass: blur + specular en borde inferior del header
  const headerBg = dark
    ? 'rgba(10, 10, 12, 0.82)'
    : 'rgba(248, 248, 252, 0.82)'
  const headerBorder = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'
  const headerShadow = dark
    ? 'inset 0 -1px 0 rgba(255,255,255,0.07), 0 4px 32px rgba(0,0,0,0.35)'
    : 'inset 0 -1px 0 rgba(255,255,255,0.60), 0 4px 20px rgba(0,0,0,0.06)'

  // Search bar: fill secundario de Apple
  const searchBg = dark ? '#1C1C1E' : '#FFFFFF'
  const searchBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const searchColor = dark ? '#636366' : '#8E8E93'

  const titleColor = dark ? '#FFFFFF' : '#000000'
  const bodyTextPrimary = dark ? '#FFFFFF' : '#000000'
  const bodyTextSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header — liquid glass neutro */}
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

        {/* Search bar — tipo Spotlight de Apple */}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={searchColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ fontSize: '15px', color: searchColor }}>Buscá camperas, vestidos...</span>
        </Link>
      </div>

      {/* Feed */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {loading && products.length === 0 ? (
          <div className="columns-2 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-2.5 break-inside-avoid">
                <ProductCardSkeleton dark={dark} />
              </div>
            ))}
          </div>
        ) : !loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span style={{ fontSize: '48px' }}>👗</span>
            <p className="mt-4 font-semibold" style={{ fontSize: '17px', color: bodyTextPrimary }}>
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
          </>
        )}
      </div>
    </div>
  )
}
