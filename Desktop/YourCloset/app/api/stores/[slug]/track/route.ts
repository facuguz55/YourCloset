import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { ApiSuccess, ApiError } from '@/lib/types'

const TrackSchema = z.object({
  event_type: z.enum([
    'profile_view',
    'whatsapp_click',
    'email_click',
    'website_click',
    'product_view',
  ]),
  product_id: z.string().optional(),
})

type Params = { params: { slug: string } }

// POST /api/stores/[slug]/track — registrar evento de analytics (fire and forget)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const store = await prisma.store.findUnique({
      where: { slug: params.slug, is_active: true },
      select: { id: true },
    })
    if (!store) return NextResponse.json({ data: null })

    const body = await request.json()
    const data = TrackSchema.parse(body)

    await prisma.storeAnalytics.create({
      data: {
        store_id: store.id,
        event_type: data.event_type,
        product_id: data.product_id,
        user_id: user?.id,
      },
    })

    return NextResponse.json<ApiSuccess<null>>({ data: null })
  } catch (err) {
    // No bloqueamos la UX si el tracking falla
    console.error('[POST /api/stores/[slug]/track]', err)
    return NextResponse.json({ data: null })
  }
}
