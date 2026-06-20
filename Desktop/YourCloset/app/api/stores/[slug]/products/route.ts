import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
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

// GET /api/stores/[slug]/products — catálogo público del local
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
      select: { id: true },
    })
    if (!store) {
      return NextResponse.json<ApiError>(
        { error: 'Local no encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const products = await prisma.product.findMany({
      where: { store_id: store.id, is_active: true },
      orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
    })

    return NextResponse.json<ApiSuccess<typeof products>>({ data: products })
  } catch (err) {
    console.error('[GET /api/stores/[slug]/products]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// POST /api/stores/[slug]/products — agregar prenda (solo el owner)
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

    const body = await request.json().catch(() => null)
    if (body === null) {
      return NextResponse.json<ApiError>(
        { error: 'Body inválido', code: 'BAD_REQUEST' },
        { status: 400 }
      )
    }

    const data = CreateProductSchema.parse(body)

    if (data.is_featured) {
      const featuredCount = await prisma.product.count({
        where: { store_id: store.id, is_featured: true, is_active: true },
      })
      if (featuredCount >= 6) {
        return NextResponse.json<ApiError>(
          { error: 'Máximo 6 prendas destacadas', code: 'FEATURED_LIMIT' },
          { status: 422 }
        )
      }
    }

    const product = await prisma.product.create({
      data: { ...data, store_id: store.id },
    })

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
