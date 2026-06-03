import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useVideoUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  async function uploadVideo(file, projectId) {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${projectId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('videos-original')
        .upload(path, file, {
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
