import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import type { ApiSuccess, ApiError } from '@/lib/types'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json<ApiError>({ error: 'No autenticado', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { data: store } = await admin
      .from('stores')
      .select('id, name, slug')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!store) {
      return NextResponse.json<ApiError>({ error: 'Sin local', code: 'NO_STORE' }, { status: 404 })
    }

    return NextResponse.json<ApiSuccess<typeof store>>({ data: store })
  } catch (err) {
    console.error('[GET /api/dashboard/store]', err)
    return NextResponse.json<ApiError>({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
