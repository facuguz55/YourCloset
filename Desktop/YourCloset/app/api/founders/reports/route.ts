import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import { verifyAdminRole } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const authResult = await verifyAdminRole(supabase)
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? ''
  const type = searchParams.get('type') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = admin.from('reports').select('*', { count: 'exact' })

  if (status) query = query.eq('status', status)
  if (type) query = query.eq('type', type)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json({ data, meta: { total: count ?? 0, page, limit } })
}
