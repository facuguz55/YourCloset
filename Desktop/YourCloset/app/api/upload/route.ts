import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

const ALLOWED_BUCKETS = ['products', 'stores', 'avatars'] as const
const MAX_SIZE = 8 * 1024 * 1024 // 8 MB

// MIME → extensión: única fuente de verdad, no se usa file.name ni file.type
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

// Detecta el MIME real por magic bytes — evita path traversal y content-type spoofing
function detectMime(buf: Buffer): string | null {
  if (buf.length < 12) return null
  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg'
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png'
  // GIF: 47 49 46 38
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif'
  // WebP: RIFF....WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp'
  return null
}

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

  const buffer = Buffer.from(await file.arrayBuffer())

  // Detectar MIME real por magic bytes — no confiamos en file.type ni file.name
  const detectedMime = detectMime(buffer)
  if (!detectedMime || !(detectedMime in MIME_TO_EXT)) {
    return NextResponse.json({ error: 'Solo se permiten imágenes (jpg, png, webp, gif)' }, { status: 415 })
  }

  // Ruta completamente sin input del usuario: UUID + extensión derivada del MIME real
  const ext = MIME_TO_EXT[detectedMime]
  const path = `${user.id}/${randomUUID()}.${ext}`

  const admin = createServiceClient()
  const { error } = await admin.storage.from(bucket).upload(path, buffer, {
    contentType: detectedMime, // MIME verificado por magic bytes, no file.type
    upsert: false,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
