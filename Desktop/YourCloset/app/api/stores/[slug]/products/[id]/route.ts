import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { ApiSuccess, ApiError } from '@/lib/types'

const UpdateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().optional(),
  price_range: z.enum(['economico', 'medio', 'premium']).optional(),
  category: z.enum(['campera', 'remera', 'pantalon', 'vestido', 'calzado', 'accesorio']).optional(),
  style_tags: z.array(z.string()).optional(),
  gender: z.enum(['masculino', 'femenino', 'unisex']).optional(),
  sizes_available: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  image_urls: z.array(z.string().url()).min(1).optional(),
  video_url: z.string().url().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

type Params = { params: { slug: string; id: string } }

// PUT /api/stores/[slug]/products/[id] — editar prenda
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

    const product = await prisma.product.findFirst({
      where: { id: params.id, store_id: store.id },
    })
    if (!product) {
      return NextResponse.json<ApiError>(
        { error: 'Prenda no encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = UpdateProductSchema.parse(body)

    if (data.is_featured === true && !product.is_featured) {
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

    const updated = await prisma.product.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json<ApiSuccess<typeof updated>>({ data: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[PUT /api/stores/[slug]/products/[id]]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// DELETE /api/stores/[slug]/products/[id] — eliminar prenda (soft delete)
export async function DELETE(request: NextRequest, { params }: Params) {
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

    const product = await prisma.product.findFirst({
      where: { id: params.id, store_id: store.id },
    })
    if (!product) {
      return NextResponse.json<ApiError>(
        { error: 'Prenda no encontrada', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Soft delete — preserva historial de analytics
    await prisma.product.update({
      where: { id: params.id },
      data: { is_active: false, is_featured: false },
    })

    return NextResponse.json<ApiSuccess<{ id: string }>>({ data: { id: params.id } })
  } catch (err) {
    console.error('[DELETE /api/stores/[slug]/products/[id]]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
