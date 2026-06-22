'use client'

import { useEffect, useState, useCallback } from 'react'
import { Flag, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

interface Report {
  id: string
  reporter_id: string
  reported_store_id: string | null
  reported_product_id: string | null
  type: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved'
  notes: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'rgba(255,149,0,0.15)', text: '#FF9500' },
  reviewed: { bg: 'rgba(10,132,255,0.15)', text: '#0A84FF' },
  resolved: { bg: 'rgba(52,199,89,0.15)', text: '#34C759' },
}

export default function FoundersReportsPage() {
  const { dark } = useDarkMode()
  const [reports, setReports] = useState<Report[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('pending')
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
    const res = await fetch(`/api/founders/reports?${params}`)
    if (res.ok) {
      const { data, meta: m } = await res.json()
      setReports(data ?? [])
      setMeta(m ?? { total: 0, page: 1, limit: 20 })
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  async function resolve(reportId: string) {
    setActing(reportId)
    await fetch(`/api/founders/reports/${reportId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    })
    setActing(null)
    load()
  }

  const totalPages = Math.ceil(meta.total / meta.limit)

  return (
    <div className="space-y-4">
      <h1 className="font-bold" style={{ fontSize: '22px', color: textPrimary }}>Reportes ({meta.total})</h1>

      <div className="flex gap-2">
        {[['pending', 'Pendientes'], ['reviewed', 'Revisados'], ['resolved', 'Resueltos'], ['', 'Todos']].map(([val, label]) => (
          <button key={val} onClick={() => { setStatusFilter(val); setPage(1) }} className="px-3 py-1.5 rounded-full text-[13px] font-medium" style={{ backgroundColor: statusFilter === val ? accentColor : bg2, color: statusFilter === val ? '#FFFFFF' : textSecondary }}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: bg }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse border-b" style={{ backgroundColor: bg2, borderColor: divider }} />)
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Flag size={32} strokeWidth={1.5} color={textSecondary} />
            <p style={{ color: textSecondary, fontSize: '15px' }}>Sin reportes con este filtro</p>
          </div>
        ) : (
          reports.map((r, i) => {
            const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending
            return (
              <div key={r.id} className="px-4 py-3" style={{ borderBottom: i < reports.length - 1 ? `0.5px solid ${divider}` : 'none' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold capitalize" style={{ backgroundColor: sc.bg, color: sc.text }}>{r.status}</span>
                      <span className="text-[11px] capitalize" style={{ color: textSecondary }}>{r.type}</span>
                    </div>
                    <p className="text-[13px]" style={{ color: textPrimary }}>{r.reason}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: textSecondary }}>{new Date(r.created_at).toLocaleDateString('es-AR')}</p>
                  </div>
                  {r.status !== 'resolved' && (
                    <button disabled={acting === r.id} onClick={() => resolve(r.id)} className="flex-none p-2 rounded-[8px]" style={{ backgroundColor: 'rgba(52,199,89,0.15)' }} title="Resolver">
                      <CheckCircle size={16} strokeWidth={1.5} color="#34C759" />
                    </button>
                  )}
                  {r.status === 'pending' && (
                    <button disabled={acting === r.id} onClick={async () => {
                      setActing(r.id)
                      await fetch(`/api/founders/reports/${r.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'reviewed' }) })
                      setActing(null); load()
                    }} className="flex-none p-2 rounded-[8px]" style={{ backgroundColor: 'rgba(10,132,255,0.15)' }} title="Marcar revisado">
                      <Clock size={16} strokeWidth={1.5} color="#0A84FF" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
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
