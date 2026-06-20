import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { ApiSuccess, ApiError, StyleProfile } from '@/lib/types'

const FeedParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
})

// GET /api/user/feed — feed personalizado por style_profile
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

    // Obtener style_profile del usuario
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { style_profile: true },
    })

    const profile = dbUser?.style_profile as StyleProfile | null

    // Si no tiene perfil, mostrar feed genérico (productos más recientes)
    if (!profile || !profile.estilos?.length) {
      const products = await prisma.product.findMany({
        where: {
          is_active: true,
          store: { is_active: true },
          ...(params.cursor && { id: { gt: params.cursor } }),
        },
        include: {
          store: {
            select: { slug: true, name: true, lat: true, lng: true, price_range: true, cover_image_url: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: params.limit,
      })

      return NextResponse.json<ApiSuccess<typeof products>>({
        data: products,
        meta: {
          cursor: products.length === params.limit ? products[products.length - 1]?.id : null,
          personalized: false,
        },
      })
    }

    // Feed personalizado: productos cuyo estilo hace match con el perfil
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        store: { is_active: true },
        // Filtrar por al menos un estilo en común
        style_tags: { hasSome: profile.estilos },
        // Filtrar por género si no es "sin_preferencia"
        ...(profile.genero !== 'sin_preferencia' && {
          gender: { in: [profile.genero, 'unisex'] },
        }),
        // Filtrar por rango de precio
        ...(profile.precio_rango && { price_range: profile.precio_rango }),
        ...(params.cursor && { id: { gt: params.cursor } }),
      },
      include: {
        store: {
          select: { slug: true, name: true, lat: true, lng: true, price_range: true, cover_image_url: true },
        },
      },
      orderBy: [
        { is_featured: 'desc' },
        { created_at: 'desc' },
      ],
      take: params.limit,
    })

    // Si hay pocos resultados con filtros estrictos, completar con items sin filtro de precio
    let finalProducts = products
    if (products.length < params.limit / 2) {
      const extras = await prisma.product.findMany({
        where: {
          is_active: true,
          store: { is_active: true },
          style_tags: { hasSome: profile.estilos },
          id: { notIn: products.map((p) => p.id) },
          ...(params.cursor && { id: { gt: params.cursor } }),
        },
        include: {
          store: {
            select: { slug: true, name: true, lat: true, lng: true, price_range: true, cover_image_url: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: params.limit - products.length,
      })
      finalProducts = [...products, ...extras]
    }

    return NextResponse.json<ApiSuccess<typeof finalProducts>>({
      data: finalProducts,
      meta: {
        cursor: finalProducts.length === params.limit
          ? finalProducts[finalProducts.length - 1]?.id
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
