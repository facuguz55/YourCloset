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
  const { status, notes } = body

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (notes) updates.notes = notes

  const { data, error } = await admin
    .from('reports')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json({ data })
}
