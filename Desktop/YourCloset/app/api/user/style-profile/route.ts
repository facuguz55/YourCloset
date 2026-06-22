import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { admin } from '@/lib/supabase/admin'
import type { ApiSuccess, ApiError } from '@/lib/types'

const StyleProfileSchema = z.object({
  estilos: z.array(z.string()).min(1, 'Seleccioná al menos un estilo'),
  genero: z.enum(['masculino', 'femenino', 'unisex', 'sin_preferencia']),
  precio_rango: z.enum(['economico', 'medio', 'premium']),
  talle: z.string().optional(),
})

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

    const body = await request.json()
    const styleProfile = StyleProfileSchema.parse(body)

    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      await admin.from('users')
        .update({ style_profile: styleProfile, onboarding_done: true })
        .eq('id', user.id)
    } else {
      await admin.from('users').insert({
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.full_name as string | undefined) ?? null,
        avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        style_profile: styleProfile,
        onboarding_done: true,
      })
    }

    return NextResponse.json<ApiSuccess<{ onboarding_done: boolean }>>({
      data: { onboarding_done: true },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        { error: err.issues[0].message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }
    console.error('[POST /api/user/style-profile]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

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

    const { data: dbUser } = await admin
      .from('users')
      .select('style_profile, onboarding_done')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json<ApiSuccess<typeof dbUser>>({ data: dbUser })
  } catch (err) {
    console.error('[GET /api/user/style-profile]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}