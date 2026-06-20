'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductWithStore } from '@/lib/types'

interface Props {
  product: ProductWithStore
}

export default function ProductCard({ product }: Props) {
  const [loaded, setLoaded] = useState(false)
  const imageUrl = product.image_urls?.[0]

  const priceLabel = product.price
    ? `$${product.price.toLocaleString('es-AR')}`
    : product.price_range === 'economico'
    ? 'Económico'
    : product.price_range === 'premium'
    ? 'Premium'
    : null

  return (
    <Link
      href={`/store/${product.store.slug}`}
      className="block overflow-hidden active:scale-[0.98] transition-transform duration-150"
      style={{
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '0.5px solid rgba(255,255,255,0.75)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset',
      }}
    >
      <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
        {!loaded && (
          <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: '#E8E8ED' }} />
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
            style={{ backgroundColor: '#E8E8ED' }}
          >
            <span className="text-[11px]" style={{ color: '#AEAEB2' }}>Sin imagen</span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-medium truncate" style={{ color: '#6E6E73' }}>
          {product.store.name}
        </p>
        <p className="text-[13px] font-semibold truncate mt-0.5" style={{ color: '#1D1D1F' }}>
          {product.name}
        </p>
        {priceLabel && (
          <p className="text-[12px] font-medium mt-1" style={{ color: '#0071E3' }}>
            {priceLabel}
          </p>
        )}
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden" style={{
      borderRadius: '16px',
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      border: '0.5px solid rgba(255,255,255,0.70)',
    }}>
      <div className="w-full animate-pulse" style={{ aspectRatio: '3/4', backgroundColor: '#E8E8ED' }} />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 rounded-full animate-pulse w-2/3" style={{ backgroundColor: '#E8E8ED' }} />
        <div className="h-3.5 rounded-full animate-pulse w-4/5" style={{ backgroundColor: '#E8E8ED' }} />
        <div className="h-3 rounded-full animate-pulse w-1/3" style={{ backgroundColor: '#E8E8ED' }} />
      </div>
    </div>
  )
}
