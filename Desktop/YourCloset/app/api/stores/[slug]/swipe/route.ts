import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado', code: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json()
  const { product_id, direction } = body

  if (!product_id || !['right', 'left'].includes(direction)) {
    return NextResponse.json({ error: 'Datos invalidos', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const { data: store } = await admin
    .from('stores')
    .select('id')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!store) return NextResponse.json({ error: 'Local no encontrado', code: 'NOT_FOUND' }, { status: 404 })

  // Validar que el product_id pertenece al local — previene analytics poisoning
  const { data: product } = await admin
    .from('products')
    .select('id')
    .eq('id', product_id)
    .eq('store_id', store.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!product) return NextResponse.json({ error: 'Prenda no encontrada', code: 'NOT_FOUND' }, { status: 404 })

  const eventType = direction === 'right' ? 'swipe_right' : 'swipe_left'

  // Registrar evento analytics
  await admin.from('store_analytics').insert({
    store_id: store.id,
    event_type: eventType,
    product_id,
    user_id: user.id,
  })

  // Si es swipe right, guardar en saved_products automáticamente
  if (direction === 'right') {
    const { data: existing } = await admin
      .from('saved_products')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .maybeSingle()

    if (!existing) {
      await admin
        .from('saved_products')
        .insert({ user_id: user.id, product_id })
    }
  }

  return NextResponse.json({ data: { success: true, event: eventType } })
}
