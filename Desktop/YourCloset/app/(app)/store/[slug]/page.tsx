import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MessageCircle, Mail, Globe, MapPin, ChevronLeft } from 'lucide-react'
import StoreTracker from './StoreTracker'
import type { StoreWithRating, Product } from '@/lib/types'
import { safeUrl } from '@/lib/safe-url'

interface Props {
  params: { slug: string }
}

async function getStore(slug: string): Promise<{ store: StoreWithRating; products: Product[] } | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const [storeRes, productsRes] = await Promise.all([
    fetch(`${base}/api/stores/${slug}`, { next: { revalidate: 60 } }),
    fetch(`${base}/api/stores/${slug}/products`, { next: { revalidate: 60 } }),
  ])
  if (!storeRes.ok) return null
  const { data: store } = await storeRes.json()
  const { data: products } = await productsRes.json()
  return { store, products: products ?? [] }
}

export default async function StorePage({ params }: Props) {
  const result = await getStore(params.slug)
  if (!result) notFound()
  const { store, products } = result

  const featured = products.filter((p: Product) => p.is_featured).slice(0, 6)
  const rest = products.filter((p: Product) => !p.is_featured)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <StoreTracker slug={params.slug} />

      {/* Back button */}
      <div className="sticky top-0 z-20 flex items-center px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <Link href="/home" className="flex items-center gap-1" style={{ color: '#0071E3' }}>
          <ChevronLeft size={20} />
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Volver</span>
        </Link>
      </div>

      {/* Cover */}
      {store.cover_image_url ? (
        <div className="relative w-full" style={{ height: '200px' }}>
          <Image src={store.cover_image_url} alt={store.name} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-full flex items-center justify-center" style={{ height: '120px', backgroundColor: '#F5F5F7' }}>
          <span style={{ fontSize: '48px' }}>👗</span>
        </div>
      )}

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="font-bold" style={{ fontSize: '28px', color: '#1D1D1F' }}>{store.name}</h1>
          {store.description && (
            <p className="mt-1" style={{ fontSize: '15px', color: '#6E6E73' }}>{store.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <MapPin size={14} style={{ color: '#6E6E73' }} />
            <span style={{ fontSize: '13px', color: '#6E6E73' }}>{store.address}, {store.city}</span>
          </div>
        </div>

        {/* Rating */}
        {store._avg_rating !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} fill={i <= Math.round(store._avg_rating!) ? '#FF9500' : 'none'} style={{ color: '#FF9500' }} />
              ))}
            </div>
            <span className="font-semibold" style={{ fontSize: '15px', color: '#1D1D1F' }}>{store._avg_rating!.toFixed(1)}</span>
            {store._rating_count !== undefined && (
              <span style={{ fontSize: '13px', color: '#6E6E73' }}>({store._rating_count} valoraciones)</span>
            )}
          </div>
        )}

        {/* Style tags */}
        {store.style_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {store.style_tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1.5 rounded-full capitalize" style={{ backgroundColor: '#F5F5F7', fontSize: '13px', color: '#6E6E73', fontWeight: 500 }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Contact */}
        <div className="grid grid-cols-3 gap-2">
          {store.phone_whatsapp && (
            <a href={`https://wa.me/${store.phone_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[12px] active:scale-95 transition-transform"
              style={{ backgroundColor: '#25D366', minHeight: '64px' }}>
              <MessageCircle size={20} color="#FFFFFF" />
              <span className="text-white font-semibold" style={{ fontSize: '12px' }}>WhatsApp</span>
            </a>
          )}
          {store.email && (
            <a href={`mailto:${store.email}`}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[12px] active:scale-95 transition-transform"
              style={{ backgroundColor: '#F5F5F7', minHeight: '64px' }}>
              <Mail size={20} style={{ color: '#1D1D1F' }} />
              <span className="font-semibold" style={{ fontSize: '12px', color: '#1D1D1F' }}>Email</span>
            </a>
          )}
          {store.website_url && (
            <a href={safeUrl(store.website_url)} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[12px] active:scale-95 transition-transform"
              style={{ backgroundColor: '#F5F5F7', minHeight: '64px' }}>
              <Globe size={20} style={{ color: '#1D1D1F' }} />
              <span className="font-semibold" style={{ fontSize: '12px', color: '#1D1D1F' }}>Tienda web</span>
            </a>
          )}
        </div>

        <div className="h-px" style={{ backgroundColor: '#F5F5F7' }} />

        {/* Featured products */}
        {featured.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3" style={{ fontSize: '20px', color: '#1D1D1F' }}>Prendas destacadas</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {featured.map((p: Product) => (
                <ProductItem key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* All products */}
        {rest.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3" style={{ fontSize: '20px', color: '#1D1D1F' }}>
              {featured.length > 0 ? 'Más prendas' : 'Catálogo'}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {rest.map((p: Product) => (
                <ProductItem key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <span style={{ fontSize: '40px' }}>🛍️</span>
            <p className="mt-3 font-medium" style={{ fontSize: '15px', color: '#6E6E73' }}>Este local todavía no cargó su catálogo.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductItem({ product }: { product: Product }) {
  const imageUrl = product.image_urls?.[0]
  return (
    <div className="overflow-hidden" style={{ borderRadius: '12px', backgroundColor: '#F5F5F7' }}>
      <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#E8E8ED' }}>
            <span style={{ fontSize: '24px' }}>👗</span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="font-semibold truncate" style={{ fontSize: '13px', color: '#1D1D1F' }}>{product.name}</p>
        {product.price && (
          <p className="mt-0.5" style={{ fontSize: '12px', color: '#0071E3', fontWeight: 600 }}>
            ${product.price.toLocaleString('es-AR')}
          </p>
        )}
      </div>
    </div>
  )
}
