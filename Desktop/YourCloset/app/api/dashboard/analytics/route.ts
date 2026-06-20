import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { ApiSuccess, ApiError } from '@/lib/types'

// GET /api/dashboard/analytics — métricas del local del store_owner autenticado
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

    const store = await prisma.store.findFirst({
      where: { owner_id: user.id, is_active: true },
      select: { id: true, name: true, slug: true },
    })
    if (!store) {
      return NextResponse.json<ApiError>(
        { error: 'No tenés un local registrado', code: 'NO_STORE' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 90)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [events, ratings, products] = await Promise.all([
      prisma.storeAnalytics.findMany({
        where: { store_id: store.id, created_at: { gte: since } },
        select: { event_type: true, product_id: true, created_at: true },
      }),
      prisma.storeRating.findMany({
        where: { store_id: store.id },
        select: { stars: true, positive_tags: true, negative_tags: true },
      }),
      prisma.product.findMany({
        where: { store_id: store.id, is_active: true },
        select: { id: true, name: true },
      }),
    ])

    // Agregaciones
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

    const allPositiveTags = ratings.flatMap((r) => r.positive_tags)
    const allNegativeTags = ratings.flatMap((r) => r.negative_tags)
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
