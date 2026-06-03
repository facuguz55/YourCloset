import { useState, useEffect, useCallback } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(isConfigured)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async () => {
    if (!isConfigured) return
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
    if (!isConfigured) return

    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchProjects])

  async function createProject({ name, format, options }) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, format, options, status: 'pending' })
      .select()
      .single()

    if (error) throw error
    setProjects(prev => [data, ...prev])
    return data
  }

  return { projects, loading, error, createProject, refetch: fetchProjects }
}
