import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { ApiSuccess, ApiError } from '@/lib/types'

const POSITIVE_TAGS = ['buena_atencion', 'gran_variedad', 'buen_precio', 'estilo_unico', 'facil_ubicar'] as const
const NEGATIVE_TAGS = ['mala_atencion', 'poco_stock', 'precios_altos', 'no_era_lo_que_mostraban'] as const

const RatingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  positive_tags: z.array(z.enum(POSITIVE_TAGS)).default([]),
  negative_tags: z.array(z.enum(NEGATIVE_TAGS)).default([]),
})

type Params = { params: { slug: string } }

// POST /api/stores/[slug]/ratings — valorar un local (una vez por usuario)
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

    const store = await prisma.store.findUnique({
      where: { slug: params.slug, is_active: true },
      select: { id: true },
    })
    if (!store) {
      return NextResponse.json<ApiError>(
        { error: 'Local no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = RatingSchema.parse(body)

    const rating = await prisma.storeRating.upsert({
      where: { store_id_user_id: { store_id: store.id, user_id: user.id } },
      create: {
        store_id: store.id,
        user_id: user.id,
        stars: data.stars,
        positive_tags: data.positive_tags as string[],
        negative_tags: data.negative_tags as string[],
      },
      update: {
        stars: data.stars,
        positive_tags: data.positive_tags as string[],
        negative_tags: data.negative_tags as string[],
      },
    })

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
