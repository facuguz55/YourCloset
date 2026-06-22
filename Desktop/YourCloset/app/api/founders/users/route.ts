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
  const search = searchParams.get('search') ?? ''
  const _role = searchParams.get('role') ?? ''
  const onboarding = searchParams.get('onboarding') ?? ''
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = admin.from('users').select('*', { count: 'exact' })

  if (search) {
    // Sanitizar para prevenir inyeccion de filtros PostgREST
    const safeSearch = search.replace(/[^A-Za-z0-9 @._-]/g, '').slice(0, 100)
    if (safeSearch) {
      query = query.ilike('email', `%${safeSearch}%`)
    }
  }
  if (onboarding === 'done') query = query.eq('onboarding_done', true)
  if (onboarding === 'pending') query = query.eq('onboarding_done', false)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  }

  // El rol viene de auth.users user_metadata — enriquecemos si hace falta
  // Para filtrar por rol haría falta un join con auth.users que no es directo
  // Por ahora devolvemos todos y el cliente filtra

  return NextResponse.json({
    data,
    meta: { total: count ?? 0, page, limit },
  })
}
