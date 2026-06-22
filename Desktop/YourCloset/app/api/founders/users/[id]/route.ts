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
  const { action, role } = body

  if (action === 'change_role' && role) {
    // Actualizar rol en auth.users.user_metadata via admin auth API
    const { error } = await admin.auth.admin.updateUserById(params.id, {
      user_metadata: { role },
    })
    if (error) {
      return NextResponse.json({ error: error.message, code: 'AUTH_ERROR' }, { status: 500 })
    }
    return NextResponse.json({ data: { success: true, action: 'change_role', role } })
  }

  if (action === 'suspend') {
    const { error } = await admin.auth.admin.updateUserById(params.id, {
      ban_duration: '87600h', // 10 años = suspendido indefinidamente
    })
    if (error) {
      return NextResponse.json({ error: error.message, code: 'AUTH_ERROR' }, { status: 500 })
    }
    return NextResponse.json({ data: { success: true, action: 'suspend' } })
  }

  if (action === 'delete') {
    const { error } = await admin.auth.admin.deleteUser(params.id)
    if (error) {
      return NextResponse.json({ error: error.message, code: 'AUTH_ERROR' }, { status: 500 })
    }
    await admin.from('users').delete().eq('id', params.id)
    return NextResponse.json({ data: { success: true, action: 'delete' } })
  }

  return NextResponse.json({ error: 'Accion invalida', code: 'BAD_REQUEST' }, { status: 400 })
}
