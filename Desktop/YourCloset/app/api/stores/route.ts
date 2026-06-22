import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import { generateUniqueSlug } from '@/lib/slug'
import type { ApiSuccess, ApiError } from '@/lib/types'

const StoreFiltersSchema = z.object({
  style: z.string().optional(),
  price_range: z.string().optional(),
  rating_min: z.coerce.number().min(1).max(5).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

const CreateStoreSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  legal_name: z.string().min(2),
  cuit: z.string().min(10).max(13),
  phone_whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  website_url: z.string().url().optional(),
  address: z.string().min(5),
  lat: z.number(),
  lng: z.number(),
  hours: z.record(z.string(), z.string()).optional(),
  style_tags: z.array(z.string()).default([]),
  gender_focus: z.array(z.string()).default([]),
  price_range: z.enum(['economico', 'medio', 'premium']).optional(),
  target_age: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  logo_url: z.string().url().optional(),
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
    const filters = StoreFiltersSchema.parse(Object.fromEntries(searchParams))

    let query = admin
      .from('stores')
      .select('*, ratings:store_ratings(stars)')
      .eq('is_active', true)
      .limit(filters.limit)

    if (filters.style) query = query.contains('style_tags', [filters.style])
    if (filters.price_range) query = query.eq('price_range', filters.price_range)

    const { data: stores, error } = await query
    if (error) throw error

    const storesWithRating = (stores ?? [])
      .map((store) => {
        const ratings = (store.ratings ?? []) as { stars: number }[]
        const avg =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
            : null
        const { ratings: _r, ...rest } = store
        return {
          ...rest,
          avg_rating: avg ? Math.round(avg * 10) / 10 : null,
          rating_count: ratings.length,
        }
      })
      .filter((s) => {
        if (filters.rating_min && s.avg_rating !== null) {
          return s.avg_rating >= filters.rating_min
        }
        return true
      })

    return NextResponse.json<ApiSuccess<typeof storesWithRating>>({ data: storesWithRating })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[GET /api/stores]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json<ApiError>(
        { error: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const role = user.user_metadata?.role
    if (role !== 'store_owner' && role !== 'admin') {
      return NextResponse.json<ApiError>(
        { error: 'Sin permiso', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = CreateStoreSchema.parse(body)

    // Garantizar que el usuario existe en public.users
    const { data: existingUser } = await admin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingUser) {
      await admin.from('users').insert({
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.name as string | undefined) ?? null,
      })
    }

    const { data: existing } = await admin
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (existing) {
      return NextResponse.json<ApiError>(
        { error: 'Ya tenés un local registrado', code: 'STORE_EXISTS' },
        { status: 409 }
      )
    }

    const slug = await generateUniqueSlug(data.name)
    const { hours, price_range, ...rest } = data

    const { data: store, error } = await admin
      .from('stores')
      .insert({
        id: crypto.randomUUID(),
        ...rest,
        slug,
        owner_id: user.id,
        city: 'Santa Fe',
        price_range: price_range ?? 'economico',
        hours: hours ?? null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json<ApiSuccess<typeof store>>({ data: store }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[POST /api/stores]', err)
    const msg = process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json<ApiError>(
      { error: msg, code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}