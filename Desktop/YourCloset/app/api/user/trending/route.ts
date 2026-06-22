import { NextResponse } from 'next/server'
import { admin } from '@/lib/supabase/admin'

export async function GET() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Prendas con más vistas en los últimos 7 días
  const { data: analytics } = await admin
    .from('store_analytics')
    .select('product_id')
    .eq('event_type', 'product_view')
    .not('product_id', 'is', null)
    .gte('created_at', since)
    .limit(200)

  if (!analytics || analytics.length === 0) {
    // Fallback: prendas más recientes destacadas
    const { data: featured } = await admin
      .from('products')
      .select('*, stores(slug, name, lat, lng, price_range)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(10)
    return NextResponse.json({ data: featured ?? [] })
  }

  // Contar views por product_id
  const counts: Record<string, number> = {}
  for (const row of analytics) {
    if (row.product_id) counts[row.product_id] = (counts[row.product_id] ?? 0) + 1
  }

  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id)

  if (topIds.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const { data: products } = await admin
    .from('products')
    .select('*, stores(slug, name, lat, lng, price_range)')
    .in('id', topIds)
    .eq('is_active', true)

  // Reordenar según ranking
  const ordered = topIds
    .map((id) => (products ?? []).find((p) => p.id === id))
    .filter(Boolean)

  return NextResponse.json({ data: ordered })
}
