import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { ApiSuccess, ApiError } from '@/lib/types'

const SearchSchema = z.object({
  query: z.string().max(200).optional(),
  category: z.enum(['campera', 'remera', 'pantalon', 'vestido', 'calzado', 'accesorio']).optional(),
  style: z.string().optional(),
  gender: z.enum(['masculino', 'femenino', 'unisex']).optional(),
  price_range: z.enum(['economico', 'medio', 'premium']).optional(),
  rating_min: z.number().min(1).max(5).optional(),
  order_by: z.enum(['relevance', 'price_asc', 'price_desc', 'rating']).default('relevance'),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
})

// POST /api/search/text — búsqueda full-text + filtros combinables
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json<ApiError>(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const filters = SearchSchema.parse(body)

    // Guardar en historial sin bloquear la respuesta
    if (filters.query) {
      prisma.searchHistory
        .create({ data: { user_id: user.id, query: filters.query, query_type: 'text' } })
        .catch(() => {})
    }

    type ProductResult = {
      id: string
      store_id: string
      name: string
      description: string | null
      price: number | null
      price_range: string | null
      category: string
      style_tags: string[]
      gender: string
      sizes_available: string[]
      colors: string[]
      image_urls: string[]
      video_url: string | null
      is_featured: boolean
      is_active: boolean
      created_at: Date
      updated_at: Date
      store_slug: string
      store_name: string
      lat: number
      lng: number
      store_price_range: string
      rank?: number
    }

    let results: ProductResult[]

    if (filters.query && filters.order_by === 'relevance') {
      // FTS via query raw
      const rows = await prisma.$queryRaw<ProductResult[]>`
        SELECT
          p.id, p.store_id, p.name, p.description, p.price, p.price_range,
          p.category, p.style_tags, p.gender, p.sizes_available, p.colors,
          p.image_urls, p.video_url, p.is_featured, p.is_active,
          p.created_at, p.updated_at,
          s.slug AS store_slug, s.name AS store_name,
          s.lat, s.lng, s.price_range AS store_price_range,
          ts_rank(p.fts, plainto_tsquery('spanish'::regconfig, ${filters.query})) AS rank
        FROM products p
        JOIN stores s ON p.store_id = s.id
        WHERE p.is_active = true
          AND s.is_active = true
          AND p.fts @@ plainto_tsquery('spanish'::regconfig, ${filters.query})
          ${filters.category ? prisma.$queryRaw`AND p.category = ${filters.category}` : prisma.$queryRaw``}
          ${filters.gender ? prisma.$queryRaw`AND p.gender = ${filters.gender}` : prisma.$queryRaw``}
          ${filters.price_range ? prisma.$queryRaw`AND p.price_range = ${filters.price_range}` : prisma.$queryRaw``}
        ORDER BY rank DESC
        LIMIT ${filters.limit}
      `
      results = rows
    } else {
      const orderBy =
        filters.order_by === 'price_asc'
          ? { price: 'asc' as const }
          : filters.order_by === 'price_desc'
          ? { price: 'desc' as const }
          : { created_at: 'desc' as const }

      const products = await prisma.product.findMany({
        where: {
          is_active: true,
          store: { is_active: true },
          ...(filters.category && { category: filters.category }),
          ...(filters.gender && { gender: filters.gender }),
          ...(filters.price_range && { price_range: filters.price_range }),
          ...(filters.style && { style_tags: { has: filters.style } }),
          ...(filters.cursor && { id: { gt: filters.cursor } }),
        },
        include: {
          store: { select: { slug: true, name: true, lat: true, lng: true, price_range: true } },
        },
        orderBy,
        take: filters.limit,
      })

      results = products.map((p) => ({
        ...p,
        store_slug: p.store.slug,
        store_name: p.store.name,
        lat: p.store.lat,
        lng: p.store.lng,
        store_price_range: p.store.price_range,
      }))
    }

    // Filtro post-query por rating mínimo
    if (filters.rating_min) {
      const storeIds = Array.from(new Set(results.map((p) => p.store_id)))
      const storeRatings = await prisma.storeRating.groupBy({
        by: ['store_id'],
        where: { store_id: { in: storeIds } },
        _avg: { stars: true },
      })
      const ratingMap = Object.fromEntries(
        storeRatings.map((r) => [r.store_id, r._avg.stars ?? 0])
      )
      results = results.filter(
        (p) => (ratingMap[p.store_id] ?? 0) >= filters.rating_min!
      )
    }

    const nextCursor =
      results.length === filters.limit ? results[results.length - 1]?.id : null

    return NextResponse.json<ApiSuccess<typeof results>>({
      data: results,
      meta: { cursor: nextCursor, count: results.length },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[POST /api/search/text]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
