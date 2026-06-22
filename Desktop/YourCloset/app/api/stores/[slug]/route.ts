import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import type { ApiSuccess, ApiError } from '@/lib/types'

const UpdateStoreSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  phone_whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  website_url: z.string().url().optional(),
  address: z.string().min(5).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  hours: z.record(z.string(), z.string()).optional(),
  style_tags: z.array(z.string()).optional(),
  gender_focus: z.array(z.string()).optional(),
  price_range: z.enum(['economico', 'medio', 'premium']).optional(),
  target_age: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  logo_url: z.string().url().optional(),
})

type Params = { params: { slug: string } }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json<ApiError>(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { data: store } = await admin
      .from('stores')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .maybeSingle()

    if (!store) {
      return NextResponse.json<ApiError>(
        { error: 'Local no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const [productsResult, ratingsResult] = await Promise.all([
      admin
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false }),
      admin
        .from('store_ratings')
        .select('stars, positive_tags, negative_tags, created_at')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false }),
    ])

    const products = productsResult.data ?? []
    const ratings = ratingsResult.data ?? []

    const avg_rating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((sum: number, r: { stars: number }) => sum + r.stars, 0) / ratings.length) * 10
          ) / 10
        : null

    // Ocultar datos legales
    const { legal_name: _ln, cuit: _c, ...publicData } = store

    return NextResponse.json<ApiSuccess<object>>({
      data: {
        ...publicData,
        products,
        ratings,
        avg_rating,
        _count: { ratings: ratings.length, products: products.length },
      },
    })
  } catch (err) {
    console.error('[GET /api/stores/[slug]]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json<ApiError>(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { data: store } = await admin
      .from('stores')
      .select('id, owner_id')
      .eq('slug', params.slug)
      .maybeSingle()

    if (!store) {
      return NextResponse.json<ApiError>(
        { error: 'Local no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const role = user.user_metadata?.role
    if (store.owner_id !== user.id && role !== 'admin') {
      return NextResponse.json<ApiError>(
        { error: 'Sin permiso', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { hours, ...rest } = UpdateStoreSchema.parse(body)

    const { data: updated, error } = await admin
      .from('stores')
      .update({
        ...rest,
        ...(hours !== undefined && { hours }),
        updated_at: new Date().toISOString(),
      })
      .eq('slug', params.slug)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json<ApiSuccess<typeof updated>>({ data: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[PUT /api/stores/[slug]]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}