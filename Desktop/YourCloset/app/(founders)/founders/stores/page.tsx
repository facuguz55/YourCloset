'use client'

import { useEffect, useState, useCallback } from 'react'
import { BadgeCheck, Pause, Play, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

interface FounderStore {
  id: string
  name: string
  slug: string
  is_active: boolean
  is_verified: boolean
  is_paused?: boolean
  city: string
  created_at: string
  _product_count?: number
}

export default function FoundersStoresPage() {
  const { dark } = useDarkMode()
  const [stores, setStores] = useState<FounderStore[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [acting, setActing] = useState<string | null>(null)

  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const bg2 = dark ? '#2C2C2E' : '#F5F5F7'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const divider = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/founders/stores?${params}`)
    if (res.ok) {
      const { data, meta: m } = await res.json()
      setStores(data ?? [])
      setMeta(m ?? { total: 0, page: 1, limit: 20 })
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  async function doAction(storeId: string, action: string) {
    setActing(storeId)
    await fetch(`/api/founders/stores/${storeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setActing(null)
    load()
  }

  const totalPages = Math.ceil(meta.total / meta.limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold" style={{ fontSize: '22px', color: textPrimary }}>Locales ({meta.total})</h1>
      </div>

      {/* Filtro status */}
      <div className="flex gap-2">
        {[['', 'Todos'], ['active', 'Activos'], ['paused', 'Pausados'], ['verified', 'Verificados']].map(([val, label]) => (
          <button key={val} onClick={() => { setStatusFilter(val); setPage(1) }} className="px-3 py-1.5 rounded-full text-[13px] font-medium" style={{ backgroundColor: statusFilter === val ? accentColor : bg2, color: statusFilter === val ? '#FFFFFF' : textSecondary }}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: bg }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse border-b" style={{ backgroundColor: bg2, borderColor: divider }} />)
        ) : stores.length === 0 ? (
          <div className="flex items-center justify-center py-12" style={{ color: textSecondary, fontSize: '15px' }}>Sin locales</div>
        ) : (
          stores.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < stores.length - 1 ? `0.5px solid ${divider}` : 'none' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium" style={{ fontSize: '14px', color: textPrimary }}>{s.name}</p>
                  {s.is_verified && <BadgeCheck size={13} strokeWidth={1.5} color={accentColor} />}
                  {s.is_paused && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>Pausado</span>}
                  {!s.is_active && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>Inactivo</span>}
                </div>
                <p style={{ fontSize: '11px', color: textSecondary }}>{s.city} · {s._product_count ?? 0} prendas</p>
              </div>
              <div className="flex items-center gap-1.5 flex-none">
                {!s.is_verified && (
                  <button disabled={acting === s.id} onClick={() => doAction(s.id, 'verify')} className="p-2 rounded-[8px]" style={{ backgroundColor: 'rgba(52,199,89,0.15)' }} title="Verificar">
                    <BadgeCheck size={14} strokeWidth={1.5} color="#34C759" />
                  </button>
                )}
                <button disabled={acting === s.id} onClick={() => doAction(s.id, s.is_paused ? 'unpause' : 'pause')} className="p-2 rounded-[8px]" style={{ backgroundColor: bg2 }} title={s.is_paused ? 'Despausar' : 'Pausar'}>
                  {s.is_paused ? <Play size={14} strokeWidth={1.5} color={textSecondary} /> : <Pause size={14} strokeWidth={1.5} color={textSecondary} />}
                </button>
                <button disabled={acting === s.id} onClick={() => { if (confirm('Eliminar local?')) doAction(s.id, 'delete') }} className="p-2 rounded-[8px]" style={{ backgroundColor: 'rgba(255,59,48,0.1)' }} title="Eliminar">
                  <Trash2 size={14} strokeWidth={1.5} color="#FF3B30" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
