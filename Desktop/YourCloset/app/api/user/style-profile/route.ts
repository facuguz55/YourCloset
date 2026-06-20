import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { ApiSuccess, ApiError } from '@/lib/types'

const StyleProfileSchema = z.object({
  estilos: z.array(z.string()).min(1, 'Seleccioná al menos un estilo'),
  genero: z.enum(['masculino', 'femenino', 'unisex', 'sin_preferencia']),
  precio_rango: z.enum(['economico', 'medio', 'premium']),
  talle: z.string().optional(),
})

// POST /api/user/style-profile — guardar/actualizar perfil de estilo del usuario
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

    const updated = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        style_profile: styleProfile,
        onboarding_done: true,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        style_profile: styleProfile,
        onboarding_done: true,
      },
    })

    return NextResponse.json<ApiSuccess<{ onboarding_done: boolean }>>({
      data: { onboarding_done: updated.onboarding_done },
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

// GET /api/user/style-profile — obtener perfil de estilo actual
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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { style_profile: true, onboarding_done: true },
    })

    return NextResponse.json<ApiSuccess<typeof dbUser>>({ data: dbUser })
  } catch (err) {
    console.error('[GET /api/user/style-profile]', err)
    return NextResponse.json<ApiError>(
      { error: 'Error interno', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
