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
      ([entry]) => {
        if (entry.isIntersecting && cursor) fetchFeed(cursor)
      },
      { rootMargin: '200px' }
    )
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [cursor, hasMore, loading, fetchFeed])

  // Theme tokens
  const headerBg = dark
    ? 'rgba(6,6,16,0.65)'
    : 'rgba(255,255,255,0.48)'
  const headerBorder = dark
    ? 'rgba(255,255,255,0.09)'
    : 'rgba(255,255,255,0.70)'
  const headerShadow = dark
    ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 20px rgba(0,0,0,0.3)'
    : '0 1px 0 rgba(255,255,255,0.95) inset, 0 1px 16px rgba(0,0,0,0.04)'
  const titleColor = dark ? '#F5F5F7' : '#1D1D1F'
  const searchBg = dark
    ? 'rgba(255,255,255,0.09)'
    : 'rgba(255,255,255,0.55)'
  const searchBorder = dark
    ? 'rgba(255,255,255,0.13)'
    : 'rgba(255,255,255,0.75)'
  const searchColor = dark ? 'rgba(174,174,178,0.65)' : '#8E8E93'
  const bodyTextPrimary = dark ? '#F5F5F7' : '#1D1D1F'
  const bodyTextSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4"
        style={{
          background: headerBg,
          backdropFilter: 'blur(52px) saturate(200%) brightness(1.06)',
          WebkitBackdropFilter: 'blur(52px) saturate(200%) brightness(1.06)',
          borderBottom: `0.5px solid ${headerBorder}`,
          boxShadow: headerShadow,
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingBottom: '12px',
        }}
      >
        <div className="flex items-center justify-between mb-3 max-w-2xl mx-auto">
          <h1 className="font-bold" style={{ fontSize: '24px', color: titleColor, letterSpacing: '-0.5px' }}>
            YourCloset
          </h1>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 max-w-2xl mx-auto"
          style={{
            height: '44px',
            borderRadius: '14px',
            background: searchBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `0.5px solid ${searchBorder}`,
            padding: '0 14px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={searchColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ fontSize: '15px', color: searchColor }}>Buscá camperas, vestidos...</span>
        </Link>
      </div>

      {/* Feed */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {loading && products.length === 0 ? (
          <div className="columns-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-3 break-inside-avoid">
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
            <div className="columns-2 gap-3">
              {products.map((p) => (
                <div key={p.id} className="mb-3 break-inside-avoid">
                  <ProductCard product={p} dark={dark} />
                </div>
              ))}
            </div>
            {loading && (
              <div className="columns-2 gap-3 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="mb-3 break-inside-avoid">
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
