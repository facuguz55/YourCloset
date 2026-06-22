import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import type { ApiSuccess, ApiError } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json<ApiError>(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const role = user.user_metadata?.role
    if (role !== 'store_owner' && role !== 'admin') {
      return NextResponse.json<ApiError>(
        { error: 'Sin permiso', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const { data: store } = await admin
      .from('stores')
      .select('id, name, slug')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!store) {
      return NextResponse.json<ApiError>(
        { error: 'No tenés un local registrado', code: 'NO_STORE' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 90)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const [eventsResult, ratingsResult, productsResult] = await Promise.all([
      admin
        .from('store_analytics')
        .select('event_type, product_id, created_at')
        .eq('store_id', store.id)
        .gte('created_at', since),
      admin
        .from('store_ratings')
        .select('stars, positive_tags, negative_tags')
        .eq('store_id', store.id),
      admin
        .from('products')
        .select('id, name')
        .eq('store_id', store.id)
        .eq('is_active', true),
    ])

    const events = eventsResult.data ?? []
    const ratings = ratingsResult.data ?? []
    const products = productsResult.data ?? []

    const byType = events.reduce(
      (acc, e) => {
        acc[e.event_type] = (acc[e.event_type] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const productViews = events
      .filter((e) => e.event_type === 'product_view' && e.product_id)
      .reduce(
        (acc, e) => {
          acc[e.product_id!] = (acc[e.product_id!] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

    const topProducts = products
      .map((p) => ({ ...p, views: productViews[p.id] ?? 0 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    const avg_rating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length) * 10
          ) / 10
        : null

    const allPositiveTags = ratings.flatMap((r) => r.positive_tags as string[])
    const allNegativeTags = ratings.flatMap((r) => r.negative_tags as string[])
    const tagCount = (tags: string[]) =>
      tags.reduce((acc, t) => { acc[t] = (acc[t] ?? 0) + 1; return acc }, {} as Record<string, number>)

    return NextResponse.json<ApiSuccess<object>>({
      data: {
        store: { id: store.id, name: store.name, slug: store.slug },
        period_days: days,
        events: {
          total: events.length,
          profile_views: byType['profile_view'] ?? 0,
          whatsapp_clicks: byType['whatsapp_click'] ?? 0,
          email_clicks: byType['email_click'] ?? 0,
          website_clicks: byType['website_click'] ?? 0,
          product_views: byType['product_view'] ?? 0,
        },
        top_products: topProducts,
        ratings: {
          count: ratings.length,
          avg: avg_rating,
          positive_tags: tagCount(allPositiveTags),
          negative_tags: tagCount(allNegativeTags),
        },
      },
    })
  } catch (err) {
    console.error('[GET /api/dashboard/analytics]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}