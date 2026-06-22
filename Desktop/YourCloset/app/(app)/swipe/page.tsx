'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Heart, X, Bookmark, MapPin, RotateCcw } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'
import type { ProductWithStore } from '@/lib/types'

const SWIPE_THRESHOLD = 100

function SwipeCard({
  product,
  onSwipe,
  isTop,
  dark,
}: {
  product: ProductWithStore
  onSwipe: (dir: 'right' | 'left') => void
  isTop: boolean
  dark: boolean
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0])

  const imageUrl = product.image_urls?.[0]
  const priceLabel = product.price
    ? `$${product.price.toLocaleString('es-AR')}`
    : product.price_range === 'economico' ? 'Económico'
    : product.price_range === 'premium' ? 'Premium'
    : null

  const cardBg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const skeletonBg = dark ? '#2C2C2E' : '#E5E5EA'

  return (
    <motion.div
      style={{
        x,
        rotate,
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        backgroundColor: cardBg,
        boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
        cursor: isTop ? 'grab' : 'default',
        touchAction: 'none',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onSwipe('right')
        else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe('left')
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {/* Imagen */}
      <div className="relative w-full" style={{ height: '65%', backgroundColor: skeletonBg }}>
        {imageUrl && (
          <Image src={imageUrl} alt={product.name} fill sizes="400px" className="object-cover" priority={isTop} />
        )}
        {/* Overlays de Like / Nope */}
        {isTop && (
          <>
            <motion.div
              className="absolute top-6 left-6 px-4 py-2 rounded-[12px] border-4 border-[#34C759] rotate-[-15deg]"
              style={{ opacity: likeOpacity }}
            >
              <p className="font-black text-[#34C759]" style={{ fontSize: '28px' }}>LIKE</p>
            </motion.div>
            <motion.div
              className="absolute top-6 right-6 px-4 py-2 rounded-[12px] border-4 border-[#FF3B30] rotate-[15deg]"
              style={{ opacity: nopeOpacity }}
            >
              <p className="font-black text-[#FF3B30]" style={{ fontSize: '28px' }}>NOPE</p>
            </motion.div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate" style={{ fontSize: '20px', color: textPrimary }}>{product.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={13} strokeWidth={1.5} color={textSecondary} />
              <p className="text-[13px] truncate" style={{ color: textSecondary }}>{product.store.name}</p>
            </div>
          </div>
          {priceLabel && (
            <span className="flex-none font-bold text-[16px]" style={{ color: dark ? '#0A84FF' : '#0071E3' }}>{priceLabel}</span>
          )}
        </div>
        {product.style_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.style_tags.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[11px] capitalize font-medium" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: textSecondary }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function SwipePage() {
  const { dark } = useDarkMode()
  const [cards, setCards] = useState<ProductWithStore[]>([])
  const [loading, setLoading] = useState(true)
  const [swipedCount, setSwipedCount] = useState(0)
  const [lastSwiped, setLastSwiped] = useState<{ product: ProductWithStore; dir: 'right' | 'left' } | null>(null)
  const [noMoreCards, setNoMoreCards] = useState(false)
  const storeSlugRef = useRef<string | null>(null)

  const bg = dark ? '#000000' : '#F2F2F7'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'

  const loadCards = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/user/feed?limit=10')
    if (res.ok) {
      const { data } = await res.json()
      setCards((data ?? []).reverse()) // reverse para que el primer item esté arriba
      if (data?.length > 0) storeSlugRef.current = data[0].store.slug
      setNoMoreCards(!data || data.length === 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  const handleSwipe = useCallback(async (dir: 'right' | 'left') => {
    const topCard = cards[cards.length - 1]
    if (!topCard) return

    setLastSwiped({ product: topCard, dir })
    setCards((prev) => prev.slice(0, -1))
    setSwipedCount((n) => n + 1)

    if (cards.length <= 3) {
      // Prefetch más cards
      const res = await fetch('/api/user/feed?limit=10')
      if (res.ok) {
        const { data } = await res.json()
        if (data?.length) {
          setCards((prev) => [...(data as ProductWithStore[]).reverse(), ...prev])
        }
      }
    }

    if (cards.length === 1) setNoMoreCards(true)

    // Registrar evento en analytics
    if (topCard.store.slug) {
      void fetch(`/api/stores/${topCard.store.slug}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: topCard.id, direction: dir }),
      })
    }
  }, [cards])

  const handleButtonSwipe = useCallback((dir: 'right' | 'left') => {
    handleSwipe(dir)
  }, [handleSwipe])

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: bg }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 flex items-center justify-between"
        style={{
          height: '56px',
          paddingTop: 'env(safe-area-inset-top)',
          background: dark ? 'rgba(10,10,12,0.82)' : 'rgba(248,248,252,0.82)',
          backdropFilter: 'blur(48px) saturate(200%)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%)',
        }}
      >
        <h1 className="font-bold" style={{ fontSize: '20px', color: textPrimary }}>Modo swipe</h1>
        <div className="flex items-center gap-1.5" style={{ fontSize: '13px', color: textSecondary }}>
          <Heart size={14} strokeWidth={1.5} color={textSecondary} />
          <span>{swipedCount}</span>
        </div>
      </div>

      {/* Card stack */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-sm" style={{ height: '520px' }}>
          {loading ? (
            <div className="absolute inset-0 rounded-[24px] animate-pulse" style={{ backgroundColor: dark ? '#1C1C1E' : '#FFFFFF' }} />
          ) : noMoreCards && cards.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-[24px] gap-4" style={{ backgroundColor: dark ? '#1C1C1E' : '#FFFFFF' }}>
              <Bookmark size={40} strokeWidth={1.5} color={textSecondary} />
              <p className="font-semibold" style={{ fontSize: '18px', color: textPrimary }}>¡Ya viste todo!</p>
              <p style={{ fontSize: '15px', color: textSecondary }}>Volvé más tarde para ver prendas nuevas.</p>
              <button onClick={loadCards} className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-semibold" style={{ backgroundColor: dark ? '#0A84FF' : '#0071E3', color: '#FFFFFF', fontSize: '15px' }}>
                <RotateCcw size={16} strokeWidth={1.5} />
                Cargar más
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {cards.map((card, i) => {
                const isTop = i === cards.length - 1
                const isNext = i === cards.length - 2
                return (
                  <motion.div
                    key={card.id}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      scale: isTop ? 1 : isNext ? 0.95 : 0.9,
                      y: isTop ? 0 : isNext ? 12 : 24,
                      zIndex: i,
                    }}
                    animate={{ scale: isTop ? 1 : isNext ? 0.95 : 0.9, y: isTop ? 0 : isNext ? 12 : 24 }}
                    exit={{ x: lastSwiped?.dir === 'right' ? 400 : -400, opacity: 0, transition: { duration: 0.3 } }}
                  >
                    <SwipeCard
                      product={card}
                      onSwipe={handleSwipe}
                      isTop={isTop}
                      dark={dark}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Botones */}
        {!loading && !noMoreCards && cards.length > 0 && (
          <div className="flex items-center gap-8 mt-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleButtonSwipe('left')}
              className="flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, backgroundColor: dark ? '#1C1C1E' : '#FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
              aria-label="No me gusta"
            >
              <X size={28} strokeWidth={2} color="#FF3B30" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleButtonSwipe('right')}
              className="flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, backgroundColor: dark ? '#1C1C1E' : '#FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
              aria-label="Me gusta"
            >
              <Heart size={28} strokeWidth={2} fill="#34C759" color="#34C759" />
            </motion.button>
          </div>
        )}

        {/* Instrucción */}
        {!loading && cards.length > 0 && (
          <p className="mt-4 text-center" style={{ fontSize: '13px', color: textSecondary }}>
            Deslizá a la derecha para guardar
          </p>
        )}
      </div>
    </div>
  )
}
