import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import { verifyAdminRole } from '@/lib/auth-helpers'

export async function GET() {
  const supabase = createClient()
  const authResult = await verifyAdminRole(supabase)
  if (authResult instanceof NextResponse) return authResult

  const { data, error } = await admin
    .from('algorithm_config')
    .select('*')
    .eq('id', 'singleton')
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  const supabase = createClient()
  const authResult = await verifyAdminRole(supabase)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()
  const { weight_onboarding, weight_saved, weight_views, weight_swipes } = body

  const total = (weight_onboarding ?? 0) + (weight_saved ?? 0) + (weight_views ?? 0) + (weight_swipes ?? 0)
  if (Math.abs(total - 1) > 0.01) {
    return NextResponse.json({
      error: 'Los pesos deben sumar exactamente 1.0 (100%)',
      code: 'VALIDATION_ERROR',
    }, { status: 400 })
  }

  const user = authResult as { id: string }

  const { data, error } = await admin
    .from('algorithm_config')
    .update({
      weight_onboarding,
      weight_saved,
      weight_views,
      weight_swipes,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', 'singleton')
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json({ data })
}
