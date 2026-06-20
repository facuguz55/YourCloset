'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, MessageCircle, Mail, Globe, Star, Package, ChevronRight } from 'lucide-react'

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
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = '#0071E3',
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color?: string
}) {
  return (
    <div className="p-4 rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <span style={{ fontSize: '13px', color: '#6E6E73', fontWeight: 500 }}>{label}</span>
      </div>
      <p className="font-bold" style={{ fontSize: '28px', color: '#1D1D1F' }}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/analytics?days=${days}`)
      .then((r) => r.json())
      .then(({ data, code }) => {
        if (code === 'NO_STORE') { router.replace('/dashboard/settings'); return }
        setAnalytics(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!analytics) return null

  const { events, top_products, ratings } = analytics

  return (
    <div className="space-y-5">
      {/* Store header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold truncate" style={{ fontSize: '22px', color: '#1D1D1F' }}>
          {analytics.store.name}
        </h1>
        <div
          className="flex rounded-[10px] p-1"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all"
              style={{
                backgroundColor: days === d ? '#0071E3' : 'transparent',
                color: days === d ? '#FFFFFF' : '#6E6E73',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Eye} label="Visitas al perfil" value={events.profile_views} />
        <StatCard icon={Package} label="Vistas de prendas" value={events.product_views} color="#34C759" />
        <StatCard icon={MessageCircle} label="Clicks WhatsApp" value={events.whatsapp_clicks} color="#25D366" />
        <StatCard icon={Mail} label="Clicks Email" value={events.email_clicks} color="#6E6E73" />
        <StatCard icon={Globe} label="Clicks tienda web" value={events.website_clicks} color="#FF9500" />
        {ratings.avg !== null && (
          <StatCard icon={Star} label="Rating promedio" value={`${ratings.avg} ★`} color="#FF9500" />
        )}
      </div>

      {/* Top products */}
      {top_products.length > 0 && (
        <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#F5F5F7' }}>
            <h2 className="font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>
              Prendas más vistas
            </h2>
          </div>
          {top_products.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: idx < top_products.length - 1 ? '0.5px solid #F5F5F7' : 'none' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold flex-none" style={{ fontSize: '17px', color: '#AEAEB2', width: '24px' }}>
                  {idx + 1}
                </span>
                <p className="truncate" style={{ fontSize: '15px', color: '#1D1D1F' }}>{p.name}</p>
              </div>
              <span className="flex-none font-medium" style={{ fontSize: '13px', color: '#6E6E73' }}>
                {p.views} vistas
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Rating tags */}
      {ratings.count > 0 && (
        <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#F5F5F7' }}>
            <h2 className="font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>
              Valoraciones ({ratings.count})
            </h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            {Object.entries(ratings.positive_tags).length > 0 && (
              <div>
                <p className="text-[13px] font-medium mb-2" style={{ color: '#34C759' }}>Lo que más valoran</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ratings.positive_tags)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tag, count]) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[13px]" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                        {tag} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}
            {Object.entries(ratings.negative_tags).length > 0 && (
              <div>
                <p className="text-[13px] font-medium mb-2" style={{ color: '#FF3B30' }}>Puntos a mejorar</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ratings.negative_tags)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tag, count]) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[13px]" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                        {tag} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick link */}
      <Link
        href={`/store/${analytics.store.slug}`}
        className="flex items-center justify-between p-5 rounded-[16px] transition-colors active:scale-[0.99]"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <span style={{ fontSize: '15px', color: '#1D1D1F', fontWeight: 500 }}>Ver mi perfil público</span>
        <ChevronRight size={18} style={{ color: '#AEAEB2' }} />
      </Link>
    </div>
  )
}
