'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductWithStore } from '@/lib/types'

interface Props {
  product: ProductWithStore
  dark?: boolean
}

export default function ProductCard({ product, dark = false }: Props) {
  const [loaded, setLoaded] = useState(false)
  const imageUrl = product.image_urls?.[0]

  const priceLabel = product.price
    ? `$${product.price.toLocaleString('es-AR')}`
    : product.price_range === 'economico'
    ? 'Económico'
    : product.price_range === 'premium'
    ? 'Premium'
    : null

  // Apple HIG: light = blanco puro, dark = #1C1C1E (secondarySystemBackground)
  const cardBg = dark ? '#1C1C1E' : '#FFFFFF'
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const cardShadow = dark
    ? 'none'
    : '0 1px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)'
  const skeletonBg = dark ? '#2C2C2E' : '#E5E5EA'
  const storeName = dark ? '#636366' : '#8E8E93'
  const productName = dark ? '#FFFFFF' : '#1D1D1F'
  const priceColor = dark ? '#0A84FF' : '#0071E3'

  return (
    <Link
      href={`/store/${product.store.slug}`}
      className="block overflow-hidden active:scale-[0.97] transition-transform duration-150"
      style={{
        borderRadius: '16px',
        backgroundColor: cardBg,
        border: `0.5px solid ${cardBorder}`,
        boxShadow: cardShadow,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
        {!loaded && (
          <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: skeletonBg }} />
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: skeletonBg }}
          >
            <span className="text-[11px]" style={{ color: '#8E8E93' }}>Sin imagen</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[11px] font-medium truncate uppercase tracking-wider" style={{ color: storeName }}>
          {product.store.name}
        </p>
        <p className="text-[13px] font-semibold truncate mt-0.5" style={{ color: productName }}>
          {product.name}
        </p>
        {priceLabel && (
          <p className="text-[12px] font-semibold mt-1" style={{ color: priceColor }}>
            {priceLabel}
          </p>
        )}
      </div>
    </Link>
  )
}

export function ProductCardSkeleton({ dark = false }: { dark?: boolean }) {
  // Apple: skeletons = systemFill grays
  const cardBg = dark ? '#1C1C1E' : '#FFFFFF'
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const skeletonBg = dark ? '#2C2C2E' : '#E5E5EA'

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: '16px',
        backgroundColor: cardBg,
        border: `0.5px solid ${cardBorder}`,
      }}
    >
      <div className="w-full animate-pulse" style={{ aspectRatio: '3/4', backgroundColor: skeletonBg }} />
      <div className="p-3 space-y-1.5">
        <div className="h-2.5 rounded-full animate-pulse w-2/3" style={{ backgroundColor: skeletonBg }} />
        <div className="h-3 rounded-full animate-pulse w-4/5" style={{ backgroundColor: skeletonBg }} />
        <div className="h-2.5 rounded-full animate-pulse w-1/3" style={{ backgroundColor: skeletonBg }} />
      </div>
    </div>
  )
}
