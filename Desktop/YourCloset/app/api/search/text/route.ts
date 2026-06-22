import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
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

    // Guardar historial sin bloquear la respuesta
    if (filters.query) {
      admin.from('search_history').insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        query: filters.query,
        query_type: 'text',
      }).then(() => {}).catch(() => {})
    }

    let q = admin
      .from('products')
      .select('*, stores!inner(slug, name, lat, lng, price_range)')
      .eq('is_active', true)
      .eq('stores.is_active', true)
      .limit(filters.limit)

    // FTS
    if (filters.query) {
      q = q.textSearch('fts', filters.query, { type: 'plain', config: 'spanish' })
    }

    // Filtros
    if (filters.category) q = q.eq('category', filters.category)
    if (filters.gender) q = q.eq('gender', filters.gender)
    if (filters.price_range) q = q.eq('price_range', filters.price_range)
    if (filters.style) q = q.contains('style_tags', [filters.style])
    if (filters.cursor) q = q.gt('id', filters.cursor)

    // Ordenamiento
    if (filters.order_by === 'price_asc') {
      q = q.order('price', { ascending: true })
    } else if (filters.order_by === 'price_desc') {
      q = q.order('price', { ascending: false })
    } else {
      q = q.order('created_at', { ascending: false })
    }

    const { data: rows, error } = await q
    if (error) throw error

    const results = (rows ?? []).map((p) => {
      const store = p.stores as { slug: string; name: string; lat: number; lng: number; price_range: string }
      const { stores: _s, ...rest } = p
      return {
        ...rest,
        store_slug: store.slug,
        store_name: store.name,
        lat: store.lat,
        lng: store.lng,
        store_price_range: store.price_range,
      }
    })

    // Filtro post-query por rating mínimo
    let finalResults = results
    if (filters.rating_min && results.length > 0) {
      const storeIds = Array.from(new Set(results.map((p) => p.store_id)))
      const { data: ratingData } = await admin
        .from('store_ratings')
        .select('store_id, stars')
        .in('store_id', storeIds)

      const ratingMap: Record<string, number[]> = {}
      for (const r of ratingData ?? []) {
        if (!ratingMap[r.store_id]) ratingMap[r.store_id] = []
        ratingMap[r.store_id].push(r.stars)
      }

      finalResults = results.filter((p) => {
        const stars = ratingMap[p.store_id] ?? []
        if (stars.length === 0) return false
        const avg = stars.reduce((a, b) => a + b, 0) / stars.length
        return avg >= filters.rating_min!
      })
    }

    const nextCursor =
      finalResults.length === filters.limit
        ? finalResults[finalResults.length - 1]?.id ?? null
        : null

    return NextResponse.json<ApiSuccess<typeof finalResults>>({
      data: finalResults,
      meta: { cursor: nextCursor, count: finalResults.length },
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