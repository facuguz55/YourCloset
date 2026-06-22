'use client'

import { useEffect, useState } from 'react'
import { Users, Store, Package, Zap, TrendingUp, UserPlus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

interface Stats {
  totalUsers: number
  totalStores: number
  totalProducts: number
  swipesToday: number
  newUsersWeek: number
  styleDistribution: Record<string, number>
  storesNoCatalog: number
}

function StatCard({ icon: Icon, label, value, color = '#0071E3', dark = false }: {
  icon: React.ElementType; label: string; value: number | string; color?: string; dark?: boolean
}) {
  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  return (
    <div className="p-4 rounded-[16px]" style={{ backgroundColor: bg }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} strokeWidth={1.5} color={color} />
        <span style={{ fontSize: '12px', color: textSecondary, fontWeight: 500 }}>{label}</span>
      </div>
      <p className="font-bold" style={{ fontSize: '26px', color: textPrimary }}>{value}</p>
    </div>
  )
}

export default function FoundersStatsPage() {
  const { dark } = useDarkMode()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'

  useEffect(() => {
    fetch('/api/founders/stats')
      .then((r) => r.json())
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 rounded-full animate-pulse" style={{ backgroundColor: dark ? '#2C2C2E' : '#E5E5EA' }} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-[16px] animate-pulse" style={{ backgroundColor: dark ? '#1C1C1E' : '#FFFFFF' }} />)}
        </div>
      </div>
    )
  }

  if (!stats) return <p style={{ color: textSecondary }}>No se pudieron cargar las estadísticas.</p>

  const styleChartData = Object.entries(stats.styleDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-5">
      <h1 className="font-bold" style={{ fontSize: '24px', color: textPrimary }}>Panel Founders</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Usuarios totales" value={stats.totalUsers} dark={dark} />
        <StatCard icon={Store} label="Locales activos" value={stats.totalStores} color="#34C759" dark={dark} />
        <StatCard icon={Package} label="Prendas totales" value={stats.totalProducts} color="#FF9500" dark={dark} />
        <StatCard icon={Zap} label="Swipes hoy" value={stats.swipesToday} color="#FF3B30" dark={dark} />
        <StatCard icon={UserPlus} label="Nuevos esta semana" value={stats.newUsersWeek} color="#AF52DE" dark={dark} />
        <StatCard icon={TrendingUp} label="Sin catálogo" value={stats.storesNoCatalog} color="#8E8E93" dark={dark} />
      </div>

      {styleChartData.length > 0 && (
        <div className="rounded-[16px] p-5" style={{ backgroundColor: bg }}>
          <h2 className="font-semibold mb-4" style={{ fontSize: '17px', color: textPrimary }}>Distribución de estilos</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={styleChartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: dark ? '#2C2C2E' : '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '13px', color: textPrimary }} />
              <Bar dataKey="value" fill={accentColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
