import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import type { ApiSuccess, ApiError } from '@/lib/types'

const CreateProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive().optional(),
  price_range: z.enum(['economico', 'medio', 'premium']).optional(),
  category: z.enum(['campera', 'remera', 'pantalon', 'vestido', 'calzado', 'accesorio']),
  style_tags: z.array(z.string()).default([]),
  gender: z.enum(['masculino', 'femenino', 'unisex']),
  sizes_available: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  image_urls: z.array(z.string().url()).min(1, 'Se requiere al menos una imagen'),
  video_url: z.string().url().optional(),
  is_featured: z.boolean().default(false),
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
      .select('id')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .maybeSingle()

    if (!store) {
      return NextResponse.json<ApiError>(
        { error: 'Local no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const { data: products, error } = await admin
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json<ApiSuccess<typeof products>>({ data: products ?? [] })
  } catch (err) {
    console.error('[GET /api/stores/[slug]/products]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: Params) {
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

    const body = await request.json().catch(() => null)
    if (body === null) {
      return NextResponse.json<ApiError>(
        { error: 'Body inválido', code: 'BAD_REQUEST' },
        { status: 400 }
      )
    }

    const data = CreateProductSchema.parse(body)

    if (data.is_featured) {
      const { count } = await admin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .eq('is_featured', true)
        .eq('is_active', true)

      if ((count ?? 0) >= 6) {
        return NextResponse.json<ApiError>(
          { error: 'Máximo 6 prendas destacadas', code: 'FEATURED_LIMIT' },
          { status: 422 }
        )
      }
    }

    const { data: product, error } = await admin
      .from('products')
      .insert({ id: crypto.randomUUID(), ...data, store_id: store.id })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json<ApiSuccess<typeof product>>({ data: product }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[POST /api/stores/[slug]/products]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}