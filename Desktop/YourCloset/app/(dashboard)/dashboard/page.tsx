'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Eye, MessageCircle, Mail, Globe, Star, Package, ChevronRight, QrCode, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

const QRCodeSVG = dynamic(() => import('qrcode.react').then((m) => m.QRCodeSVG), { ssr: false })

interface Analytics {
  store: { id: string; name: string; slug: string }
  period_days: number
  events: {
    total: number
    profile_views: number
    whatsapp_clicks: number
    email_clicks: number
    website_clicks: number
    product_views: number
  }
  top_products: Array<{ id: string; name: string; views: number }>
  ratings: {
    count: number
    avg: number | null
    positive_tags: Record<string, number>
    negative_tags: Record<string, number>
  }
  daily_views?: Array<{ date: string; views: number }>
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = '#0071E3',
  dark = false,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color?: string
  dark?: boolean
}) {
  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  return (
    <div className="p-4 rounded-[16px]" style={{ backgroundColor: bg }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} strokeWidth={1.5} color={color} />
        <span style={{ fontSize: '13px', color: textSecondary, fontWeight: 500 }}>{label}</span>
      </div>
      <p className="font-bold" style={{ fontSize: '28px', color: textPrimary }}>{value}</p>
    </div>
  )
}

function QRModal({ url, name, dark, onClose }: { url: string; name: string; dark: boolean; onClose: () => void }) {
  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="p-8 rounded-[24px] flex flex-col items-center gap-5 w-full max-w-xs" style={{ backgroundColor: bg }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold" style={{ fontSize: '20px', color: textPrimary }}>QR de tu local</h3>
        <div className="p-4 rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }}>
          <QRCodeSVG value={url} size={200} level="H" includeMargin={false} />
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ fontSize: '15px', color: textPrimary }}>{name}</p>
          <p className="mt-1" style={{ fontSize: '12px', color: textSecondary }}>Compartí este código para que te encuentren</p>
        </div>
        <button onClick={onClose} className="w-full h-[44px] rounded-[12px] font-semibold" style={{ backgroundColor: dark ? '#2C2C2E' : '#F5F5F7', color: dark ? '#AEAEB2' : '#1D1D1F', fontSize: '15px' }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { dark } = useDarkMode()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/analytics?days=${days}`)
      .then((r) => r.json())
      .then(({ data, code }) => {
        if (!data || code === 'NO_STORE' || code === 'INTERNAL_ERROR' || code === 'UNAUTHORIZED') {
          router.replace('/dashboard/settings')
          return
        }
        setAnalytics(data)
      })
      .catch(() => router.replace('/dashboard/settings'))
      .finally(() => setLoading(false))
  }, [days, router])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[16px] animate-pulse" style={{ backgroundColor: dark ? '#1C1C1E' : '#FFFFFF' }} />
        ))}
      </div>
    )
  }

  if (!analytics) return null

  const { events, top_products, ratings } = analytics
  const bg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const divider = dark ? 'rgba(255,255,255,0.08)' : '#F5F5F7'
  const accentColor = dark ? '#0A84FF' : '#0071E3'

  const storeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/store/${analytics.store.slug}`

  // Datos simulados para el gráfico si no hay daily_views
  const chartData = analytics.daily_views ?? Array.from({ length: days === 7 ? 7 : 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days === 7 ? 6 - i : 13 - i))
    return { date: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }), views: 0 }
  })

  return (
    <div className="space-y-5">
      {/* Store header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold truncate" style={{ fontSize: '22px', color: textPrimary }}>
          {analytics.store.name}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center justify-center w-[40px] h-[40px] rounded-[10px]"
            style={{ backgroundColor: bg }}
            aria-label="Ver QR del local"
          >
            <QrCode size={20} strokeWidth={1.5} color={accentColor} />
          </button>
          <div className="flex rounded-[10px] p-1" style={{ backgroundColor: bg }}>
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all"
                style={{ backgroundColor: days === d ? accentColor : 'transparent', color: days === d ? '#FFFFFF' : textSecondary }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Eye} label="Visitas" value={events.profile_views} dark={dark} />
        <StatCard icon={Package} label="Prendas vistas" value={events.product_views} color="#34C759" dark={dark} />
        <StatCard icon={MessageCircle} label="WhatsApp" value={events.whatsapp_clicks} color="#25D366" dark={dark} />
        <StatCard icon={Mail} label="Email" value={events.email_clicks} color="#8E8E93" dark={dark} />
        <StatCard icon={Globe} label="Tienda web" value={events.website_clicks} color="#FF9500" dark={dark} />
        {ratings.avg !== null && (
          <StatCard icon={Star} label="Rating" value={`${ratings.avg}/5`} color="#FF9500" dark={dark} />
        )}
      </div>

      {/* Gráfico de visitas */}
      <div className="rounded-[16px] p-5" style={{ backgroundColor: bg }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} strokeWidth={1.5} color={accentColor} />
          <h2 className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>Visitas diarias</h2>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: dark ? '#2C2C2E' : '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '13px', color: textPrimary }}
              cursor={{ stroke: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}
            />
            <Line type="monotone" dataKey="views" stroke={accentColor} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: accentColor }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top products */}
      {top_products.length > 0 && (
        <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: bg }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: divider }}>
            <h2 className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>Prendas más vistas</h2>
          </div>
          {top_products.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: idx < top_products.length - 1 ? `0.5px solid ${divider}` : 'none' }}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold flex-none" style={{ fontSize: '17px', color: textSecondary, width: '24px' }}>{idx + 1}</span>
                <p className="truncate" style={{ fontSize: '15px', color: textPrimary }}>{p.name}</p>
              </div>
              <span className="flex-none font-medium" style={{ fontSize: '13px', color: textSecondary }}>{p.views} vistas</span>
            </div>
          ))}
        </div>
      )}

      {/* Rating tags */}
      {ratings.count > 0 && (
        <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: bg }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: divider }}>
            <h2 className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>Valoraciones ({ratings.count})</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            {Object.entries(ratings.positive_tags).length > 0 && (
              <div>
                <p className="text-[13px] font-medium mb-2" style={{ color: '#34C759' }}>Lo que más valoran</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ratings.positive_tags).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-[13px]" style={{ backgroundColor: dark ? 'rgba(52,199,89,0.15)' : '#F0FDF4', color: '#16A34A' }}>{tag} ({count})</span>
                  ))}
                </div>
              </div>
            )}
            {Object.entries(ratings.negative_tags).length > 0 && (
              <div>
                <p className="text-[13px] font-medium mb-2" style={{ color: '#FF3B30' }}>Puntos a mejorar</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ratings.negative_tags).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-[13px]" style={{ backgroundColor: dark ? 'rgba(255,59,48,0.15)' : '#FEF2F2', color: '#DC2626' }}>{tag} ({count})</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ver perfil público */}
      <Link
        href={`/store/${analytics.store.slug}`}
        className="flex items-center justify-between p-5 rounded-[16px] transition-colors active:scale-[0.99]"
        style={{ backgroundColor: bg }}
      >
        <span style={{ fontSize: '15px', color: textPrimary, fontWeight: 500 }}>Ver mi perfil público</span>
        <ChevronRight size={18} strokeWidth={1.5} color={textSecondary} />
      </Link>

      {showQR && <QRModal url={storeUrl} name={analytics.store.name} dark={dark} onClose={() => setShowQR(false)} />}
    </div>
  )
}
