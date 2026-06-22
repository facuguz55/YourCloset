import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import type { ApiSuccess, ApiError, StyleProfile } from '@/lib/types'

const FeedParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json<ApiError>(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const params = FeedParamsSchema.parse(Object.fromEntries(searchParams))

    const { data: dbUser } = await admin
      .from('users')
      .select('style_profile')
      .eq('id', user.id)
      .maybeSingle()

    const profile = dbUser?.style_profile as StyleProfile | null

    if (!profile || !profile.estilos?.length) {
      let q = admin
        .from('products')
        .select('*, stores(slug, name, lat, lng, price_range, cover_image_url)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(params.limit)

      if (params.cursor) q = q.gt('id', params.cursor)

      const { data: products, error } = await q
      if (error) throw error

      return NextResponse.json<ApiSuccess<typeof products>>({
        data: products ?? [],
        meta: {
          cursor: (products ?? []).length === params.limit
            ? (products ?? [])[products!.length - 1]?.id ?? null
            : null,
          personalized: false,
        },
      })
    }

    // Feed personalizado
    let q = admin
      .from('products')
      .select('*, stores(slug, name, lat, lng, price_range, cover_image_url)')
      .eq('is_active', true)
      .overlaps('style_tags', profile.estilos)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(params.limit)

    if (profile.genero !== 'sin_preferencia') {
      q = q.in('gender', [profile.genero, 'unisex'])
    }
    if (profile.precio_rango) {
      q = q.eq('price_range', profile.precio_rango)
    }
    if (params.cursor) q = q.gt('id', params.cursor)

    const { data: products, error } = await q
    if (error) throw error

    let finalProducts = products ?? []

    // Completar con items sin filtro de precio si hay pocos
    if (finalProducts.length < params.limit / 2) {
      const excludeIds = finalProducts.map((p) => p.id)

      let q2 = admin
        .from('products')
        .select('*, stores(slug, name, lat, lng, price_range, cover_image_url)')
        .eq('is_active', true)
        .overlaps('style_tags', profile.estilos)
        .order('created_at', { ascending: false })
        .limit(params.limit - finalProducts.length)

      if (profile.genero !== 'sin_preferencia') {
        q2 = q2.in('gender', [profile.genero, 'unisex'])
      }
      if (params.cursor) q2 = q2.gt('id', params.cursor)
      if (excludeIds.length > 0) {
        q2 = q2.not('id', 'in', ())
      }

      const { data: extras } = await q2
      finalProducts = [...finalProducts, ...(extras ?? [])]
    }

    return NextResponse.json<ApiSuccess<typeof finalProducts>>({
      data: finalProducts,
      meta: {
        cursor: finalProducts.length === params.limit
          ? finalProducts[finalProducts.length - 1]?.id ?? null
          : null,
        personalized: true,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[GET /api/user/feed]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}