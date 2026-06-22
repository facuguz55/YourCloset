'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Shield, Ban, Trash2 } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

interface FounderUser {
  id: string
  email: string
  onboarding_done: boolean
  created_at: string
}

interface Meta { total: number; page: number; limit: number }

const ROLES = [
  { value: 'user', label: 'Usuario' },
  { value: 'store_owner', label: 'Store owner' },
  { value: 'admin', label: 'Admin' },
]

export default function FoundersUsersPage() {
  const { dark } = useDarkMode()
  const [users, setUsers] = useState<FounderUser[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionUserId, setActionUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const bg2 = dark ? '#2C2C2E' : '#F5F5F7'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const divider = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    const res = await fetch(`/api/founders/users?${params}`)
    if (res.ok) {
      const { data, meta: m } = await res.json()
      setUsers(data ?? [])
      setMeta(m ?? { total: 0, page: 1, limit: 20 })
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])

  async function doAction(userId: string, action: string, extra?: Record<string, unknown>) {
    setActionLoading(true)
    await fetch(`/api/founders/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    setActionUserId(null)
    setActionLoading(false)
    load()
  }

  const totalPages = Math.ceil(meta.total / meta.limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold" style={{ fontSize: '22px', color: textPrimary }}>
          Usuarios ({meta.total})
        </h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 rounded-[12px]" style={{ backgroundColor: bg, height: '44px', border: `0.5px solid ${divider}` }}>
        <Search size={16} strokeWidth={1.5} color={textSecondary} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por email..."
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: '15px', color: textPrimary }}
        />
      </div>

      {/* Table */}
      <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: bg }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse border-b" style={{ backgroundColor: bg2, borderColor: divider }} />
          ))
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-12" style={{ color: textSecondary, fontSize: '15px' }}>Sin usuarios</div>
        ) : (
          users.map((u, i) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < users.length - 1 ? `0.5px solid ${divider}` : 'none' }}>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium" style={{ fontSize: '14px', color: textPrimary }}>{u.email}</p>
                <p style={{ fontSize: '11px', color: textSecondary }}>
                  {u.onboarding_done ? 'Onboarding completo' : 'Sin onboarding'} · {new Date(u.created_at).toLocaleDateString('es-AR')}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-none">
                <button onClick={() => setActionUserId(actionUserId === u.id ? null : u.id)} className="p-2 rounded-[8px]" style={{ backgroundColor: bg2 }} title="Acciones">
                  <Shield size={14} strokeWidth={1.5} color={textSecondary} />
                </button>
              </div>
              {/* Actions panel inline */}
              {actionUserId === u.id && (
                <div className="absolute right-4 mt-12 z-10 rounded-[12px] shadow-lg p-3 space-y-2" style={{ backgroundColor: bg, border: `0.5px solid ${divider}`, minWidth: '180px' }}>
                  <p style={{ fontSize: '12px', color: textSecondary, fontWeight: 600 }}>Cambiar rol a:</p>
                  {ROLES.map(({ value, label }) => (
                    <button key={value} disabled={actionLoading} onClick={() => doAction(u.id, 'change_role', { role: value })} className="w-full text-left px-3 py-1.5 rounded-[8px] text-[13px] font-medium" style={{ backgroundColor: bg2, color: textPrimary }}>
                      {label}
                    </button>
                  ))}
                  <hr style={{ borderColor: divider }} />
                  <button disabled={actionLoading} onClick={() => doAction(u.id, 'suspend')} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-medium" style={{ backgroundColor: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>
                    <Ban size={13} strokeWidth={1.5} /> Suspender
                  </button>
                  <button disabled={actionLoading} onClick={() => { if (confirm('Eliminar usuario?')) doAction(u.id, 'delete') }} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-medium" style={{ backgroundColor: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                    <Trash2 size={13} strokeWidth={1.5} /> Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex items-center gap-1 px-3 py-2 rounded-[10px] text-[13px]" style={{ backgroundColor: bg, color: page <= 1 ? textSecondary : textPrimary }}>
            <ChevronLeft size={14} strokeWidth={1.5} /> Anterior
          </button>
          <span style={{ fontSize: '13px', color: textSecondary }}>Página {page} de {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-1 px-3 py-2 rounded-[10px] text-[13px]" style={{ backgroundColor: bg, color: page >= totalPages ? textSecondary : textPrimary }}>
            Siguiente <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  )
}
