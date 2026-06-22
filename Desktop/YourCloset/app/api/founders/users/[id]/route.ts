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
    const ALLOWED_ROLES = ['user', 'store_owner', 'admin']
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Rol invalido', code: 'BAD_REQUEST' }, { status: 400 })
    }
    // El admin no puede cambiar su propio rol
    const caller = authResult as { id: string }
    if (params.id === caller.id) {
      return NextResponse.json({ error: 'No podes cambiar tu propio rol', code: 'FORBIDDEN' }, { status: 403 })
    }
    // Usar app_metadata (solo editable por service-role) en lugar de user_metadata
    const { error } = await admin.auth.admin.updateUserById(params.id, {
      app_metadata: { role },
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
