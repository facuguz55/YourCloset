import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import type { ApiSuccess, ApiError } from '@/lib/types'

const POSITIVE_TAGS = ['buena_atencion', 'gran_variedad', 'buen_precio', 'estilo_unico', 'facil_ubicar'] as const
const NEGATIVE_TAGS = ['mala_atencion', 'poco_stock', 'precios_altos', 'no_era_lo_que_mostraban'] as const

const RatingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  positive_tags: z.array(z.enum(POSITIVE_TAGS)).default([]),
  negative_tags: z.array(z.enum(NEGATIVE_TAGS)).default([]),
})

type Params = { params: { slug: string } }

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

    const body = await request.json()
    const parsed = RatingSchema.parse(body)

    const { data: existing } = await admin
      .from('store_ratings')
      .select('id')
      .eq('store_id', store.id)
      .eq('user_id', user.id)
      .maybeSingle()

    let rating
    if (existing) {
      const { data, error } = await admin
        .from('store_ratings')
        .update({
          stars: parsed.stars,
          positive_tags: parsed.positive_tags as string[],
          negative_tags: parsed.negative_tags as string[],
        })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      rating = data
    } else {
      const { data, error } = await admin
        .from('store_ratings')
        .insert({
          id: crypto.randomUUID(),
          store_id: store.id,
          user_id: user.id,
          stars: parsed.stars,
          positive_tags: parsed.positive_tags as string[],
          negative_tags: parsed.negative_tags as string[],
        })
        .select()
        .single()
      if (error) throw error
      rating = data
    }

    return NextResponse.json<ApiSuccess<typeof rating>>({ data: rating }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[POST /api/stores/[slug]/ratings]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}