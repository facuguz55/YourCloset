import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProject(projectId) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) return

    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) setError(error.message)
      else setProject(data)
      setLoading(false)
    }

    fetchProject()

    // Realtime: escucha actualizaciones del proyecto (progreso, status, step)
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        (payload) => setProject(payload.new)
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [projectId])

  async function updateProject(updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error
    setProject(data)
    return data
  }

  return { project, loading, error, updateProject }
}
