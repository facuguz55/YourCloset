import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import { verifyAdminRole } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const authResult = await verifyAdminRole(supabase)
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const status = searchParams.get('status') ?? ''
  const verified = searchParams.get('verified') ?? ''
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = admin
    .from('stores')
    .select('id, name, slug, owner_id, is_active, is_verified, is_paused, created_at, cover_image_url, style_tags', { count: 'exact' })

  if (status === 'active') query = query.eq('is_active', true).eq('is_paused', false)
  if (status === 'paused') query = query.eq('is_paused', true)
  if (status === 'inactive') query = query.eq('is_active', false)
  if (verified === 'yes') query = query.eq('is_verified', true)
  if (verified === 'no') query = query.eq('is_verified', false)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  }

  // Agregar conteo de productos por store
  const storeIds = data?.map((s) => s.id) ?? []
  const productCounts: Record<string, number> = {}
  if (storeIds.length > 0) {
    const { data: products } = await admin
      .from('products')
      .select('store_id')
      .in('store_id', storeIds)
      .eq('is_active', true)

    for (const p of products ?? []) {
      productCounts[p.store_id] = (productCounts[p.store_id] ?? 0) + 1
    }
  }

  const enriched = (data ?? []).map((s) => ({
    ...s,
    product_count: productCounts[s.id] ?? 0,
  }))

  return NextResponse.json({ data: enriched, meta: { total: count ?? 0, page, limit } })
}
