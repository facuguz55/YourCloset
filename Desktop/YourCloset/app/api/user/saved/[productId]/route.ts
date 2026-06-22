import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'

export async function POST(
  _request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado', code: 'UNAUTHORIZED' }, { status: 401 })

  const { data: existing } = await admin
    .from('saved_products')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('product_id', params.productId)
    .maybeSingle()

  if (existing) {
    // Ya está guardado → quitar
    await admin
      .from('saved_products')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', params.productId)
    return NextResponse.json({ data: { saved: false } })
  }

  // No está → guardar
  await admin
    .from('saved_products')
    .insert({ user_id: user.id, product_id: params.productId })

  return NextResponse.json({ data: { saved: true } })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: { saved: false } })

  const { data } = await admin
    .from('saved_products')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('product_id', params.productId)
    .maybeSingle()

  return NextResponse.json({ data: { saved: !!data } })
}
