import { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function verifyStoreOwnership(
  slug: string,
  userId: string,
  supabase: SupabaseClient
): Promise<{ id: string; owner_id: string } | NextResponse> {
  const { data: store } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) {
    return NextResponse.json({ error: 'Local no encontrado', code: 'NOT_FOUND' }, { status: 404 })
  }

  if (store.owner_id !== userId) {
    return NextResponse.json({ error: 'No autorizado', code: 'FORBIDDEN' }, { status: 403 })
  }

  return store
}

export async function verifyAdminRole(supabase: SupabaseClient): Promise<
  { id: string; email: string; user_metadata: Record<string, unknown> } | NextResponse
> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'No autenticado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado', code: 'FORBIDDEN' }, { status: 403 })
  }

  return user as { id: string; email: string; user_metadata: Record<string, unknown> }
}

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  supabase: SupabaseClient,
  maxRequests = 20
): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60 * 1000).toISOString()

  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= maxRequests) return false

  // Registrar este request (fire and forget)
  void supabase
    .from('rate_limits')
    .insert({ user_id: userId, endpoint })

  return true
}
