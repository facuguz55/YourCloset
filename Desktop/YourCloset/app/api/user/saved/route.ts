import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado', code: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '40'), 100)
  const cursor = searchParams.get('cursor') ?? null

  let q = admin
    .from('saved_products')
    .select('product_id, saved_at, products(*, stores(slug, name, lat, lng, price_range))')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })
    .limit(limit)

  if (cursor) q = q.lt('saved_at', cursor)

  const { data, error } = await q

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  const items = (data ?? [])
    .map((row) => ({ ...(row.products as unknown as Record<string, unknown>), _saved_at: row.saved_at }))
    .filter(Boolean)

  const lastItem = data?.[data.length - 1]
  const nextCursor = data && data.length === limit ? lastItem?.saved_at ?? null : null

  return NextResponse.json({
    data: items,
    meta: { next_cursor: nextCursor },
  })
}
