import { useState } from 'react'
import { supabase } from '../lib/supabase'

// MIME types y extensiones aceptadas — cualquier otra cosa se rechaza antes de subir
const ALLOWED_MIME = new Set(['video/mp4', 'video/quicktime', 'video/x-m4v'])
const ALLOWED_EXT  = new Set(['mp4', 'mov', 'm4v'])

// Mapea MIME → extensión segura para el nombre del archivo en Storage
const MIME_TO_EXT = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/x-m4v': 'm4v' }

export function useVideoUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  async function uploadVideo(file, projectId) {
    setUploading(true)
    setProgress(0)
    setError(null)

    // Validar MIME y extensión antes de cualquier operación de red
    const mime = file.type.toLowerCase()
    const ext  = file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_MIME.has(mime) || !ALLOWED_EXT.has(ext)) {
      const msg = `Formato no permitido: ${file.name}. Solo se aceptan MP4, MOV y M4V.`
      setError(msg)
      setUploading(false)
      throw new Error(msg)
    }

    // Usar extensión derivada del MIME (nunca del nombre del usuario)
    const safeExt = MIME_TO_EXT[mime] ?? 'mp4'
    const path = `${projectId}/${Date.now()}.${safeExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('videos-original')
        .upload(path, file, {
          contentType: mime,   // forzar el content-type correcto en Storage
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (evt) => {
            if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
          },
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('videos-original')
        .getPublicUrl(path)

      // Actualizar el proyecto con la URL del video original
      const { error: dbError } = await supabase
        .from('projects')
        .update({ original_url: publicUrl, status: 'pending' })
        .eq('id', projectId)

      if (dbError) throw dbError

      setProgress(100)
      return publicUrl
    } catch (err) {
      setError(err.message || 'Error al subir el video')
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { uploadVideo, uploading, progress, error }
}
