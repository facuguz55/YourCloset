import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_BUCKETS = ['products', 'stores', 'avatars'] as const
const MAX_SIZE = 8 * 1024 * 1024 // 8 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  // Verificar sesión
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const bucket = formData.get('bucket') as string | null

  if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  if (!bucket || !ALLOWED_BUCKETS.includes(bucket as typeof ALLOWED_BUCKETS[number])) {
    return NextResponse.json({ error: 'Bucket inválido' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'El archivo no puede superar 8 MB' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Solo se permiten imágenes (jpg, png, webp, gif)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const admin = createServiceClient()
  const { error } = await admin.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
