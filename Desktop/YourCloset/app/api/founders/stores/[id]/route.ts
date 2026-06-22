import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import { verifyAdminRole } from '@/lib/auth-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const authResult = await verifyAdminRole(supabase)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()
  const { action } = body

  const updates: Record<string, unknown> = {}

  if (action === 'verify') updates.is_verified = true
  else if (action === 'unverify') updates.is_verified = false
  else if (action === 'pause') updates.is_paused = true
  else if (action === 'unpause') updates.is_paused = false
  else if (action === 'deactivate') updates.is_active = false
  else if (action === 'activate') { updates.is_active = true; updates.is_paused = false }
  else if (action === 'delete') {
    const { error } = await admin.from('stores').update({ is_active: false }).eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
    return NextResponse.json({ data: { success: true, action: 'delete' } })
  } else {
    return NextResponse.json({ error: 'Accion invalida', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('stores')
    .update(updates)
    .eq('id', params.id)
    .select('id, name, is_active, is_verified, is_paused')
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json({ data })
}
