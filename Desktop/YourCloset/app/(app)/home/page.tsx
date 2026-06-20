'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import ProductCard, { ProductCardSkeleton } from '@/components/search/ProductCard'
import type { ProductWithStore } from '@/lib/types'

const LIMIT = 20

export default function HomePage() {
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
    fetchFeed(null)
  }, [fetchFeed])

  useEffect(() => {
    if (!hasMore || loading) return
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && cursor) {
          fetchFeed(cursor)
        }
      },
      { rootMargin: '200px' }
    )
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [cursor, hasMore, loading, fetchFeed])

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-safe-top"
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
        <div className="flex items-center justify-between mb-3 max-w-2xl mx-auto">
          <h1 className="font-bold" style={{ fontSize: '24px', color: '#1D1D1F' }}>
            YourCloset
          </h1>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 max-w-2xl mx-auto"
          style={{
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#F5F5F7',
            padding: '0 12px',
          }}
        >
          <Search size={16} style={{ color: '#AEAEB2' }} />
          <span style={{ fontSize: '15px', color: '#AEAEB2' }}>Buscá camperas, vestidos...</span>
        </Link>
      </div>

      {/* Feed */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {loading && products.length === 0 ? (
          <div className="columns-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-3 break-inside-avoid">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span style={{ fontSize: '48px' }}>👗</span>
            <p className="mt-4 font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>
              Tu feed está vacío
            </p>
            <p className="mt-1" style={{ fontSize: '15px', color: '#6E6E73' }}>
              Todavía no hay prendas que coincidan con tu estilo. ¡Volvé pronto!
            </p>
            <Link
              href="/search"
              className="mt-6 px-6 py-3 rounded-[12px] font-semibold"
              style={{ backgroundColor: '#0071E3', color: '#FFFFFF', fontSize: '15px' }}
            >
              Explorar todo
            </Link>
          </div>
        ) : (
          <>
            <div className="columns-2 gap-3">
              {products.map((p) => (
                <div key={p.id} className="mb-3 break-inside-avoid">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            {loading && (
              <div className="columns-2 gap-3 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="mb-3 break-inside-avoid">
                    <ProductCardSkeleton />
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
