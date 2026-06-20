import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
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
  style_tags: z.array(z.string()).min(1).optional(),
  gender_focus: z.array(z.string()).min(1).optional(),
  price_range: z.enum(['economico', 'medio', 'premium']).optional(),
  target_age: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  logo_url: z.string().url().optional(),
})

type Params = { params: { slug: string } }

// GET /api/stores/[slug] — perfil público del local
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

    const store = await prisma.store.findUnique({
      where: { slug: params.slug, is_active: true },
      include: {
        products: {
          where: { is_active: true },
          orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
        },
        ratings: {
          select: { stars: true, positive_tags: true, negative_tags: true, created_at: true },
          orderBy: { created_at: 'desc' },
        },
        _count: { select: { ratings: true, products: true } },
      },
    })

    if (!store) {
      return NextResponse.json<ApiError>(
        { error: 'Local no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const avg_rating =
      store.ratings.length > 0
        ? Math.round(
            (store.ratings.reduce((sum, r) => sum + r.stars, 0) / store.ratings.length) * 10
          ) / 10
        : null

    // Ocultar datos legales en respuesta pública
    const { legal_name: _ln, cuit: _c, ...publicData } = store

    return NextResponse.json<ApiSuccess<typeof publicData & { avg_rating: number | null }>>({
      data: { ...publicData, avg_rating },
    })
  } catch (err) {
    console.error('[GET /api/stores/[slug]]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// PUT /api/stores/[slug] — editar local (solo el owner)
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

    const store = await prisma.store.findUnique({ where: { slug: params.slug } })
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
    const data = UpdateStoreSchema.parse(body)
    const { hours, ...rest } = data

    const updated = await prisma.store.update({
      where: { slug: params.slug },
      data: {
        ...rest,
        ...(hours && { hours: hours as Prisma.InputJsonValue }),
      },
    })

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
