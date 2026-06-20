'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Edit3, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const STYLE_LABELS: Record<string, string> = {
  streetwear: 'Streetwear',
  casual: 'Casual',
  formal: 'Formal',
  sport: 'Sport',
  bohemio: 'Bohemio',
  minimalista: 'Minimalista',
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [styleProfile, setStyleProfile] = useState<{ estilos?: string[]; genero?: string; precio_rango?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const res = await fetch('/api/user/style-profile')
        if (res.ok) {
          const { data } = await res.json()
          setStyleProfile(data)
        }
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F7' }}>
        <div className="w-8 h-8 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Usuario'
  const email = user?.email ?? ''

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Header */}
      <div className="px-4 pt-safe-top" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: '16px', backgroundColor: '#FFFFFF' }}>
        <h1 className="font-bold" style={{ fontSize: '24px', color: '#1D1D1F', paddingBottom: '4px' }}>Mi perfil</h1>
      </div>

      {/* Avatar + info */}
      <div className="px-4 py-6 flex items-center gap-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '0.5px solid #F5F5F7', marginBottom: '8px' }}>
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center flex-none"
          style={{ backgroundColor: '#F5F5F7' }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: '32px' }}>👤</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold truncate" style={{ fontSize: '20px', color: '#1D1D1F' }}>{name}</p>
          <p className="truncate" style={{ fontSize: '13px', color: '#6E6E73' }}>{email}</p>
        </div>
      </div>

      {/* Style profile */}
      <div className="mx-4 mb-4 p-5 rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>Tu estilo</h2>
          <Link href="/onboarding" className="flex items-center gap-1" style={{ color: '#0071E3', fontSize: '13px', fontWeight: 600 }}>
            <Edit3 size={14} />
            Editar
          </Link>
        </div>

        {styleProfile?.estilos && styleProfile.estilos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {styleProfile.estilos.map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-full capitalize" style={{ backgroundColor: '#EBF4FF', fontSize: '13px', color: '#0071E3', fontWeight: 500 }}>
                {STYLE_LABELS[s] ?? s}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between py-1">
            <span style={{ fontSize: '15px', color: '#6E6E73' }}>No configurado aún</span>
            <Link href="/onboarding" className="flex items-center gap-1" style={{ color: '#0071E3', fontSize: '15px', fontWeight: 600 }}>
              Configurar
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="mx-4 mb-4 rounded-[16px] overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        <Link href="/search" className="flex items-center justify-between px-5 h-[52px] border-b" style={{ borderColor: '#F5F5F7' }}>
          <span style={{ fontSize: '15px', color: '#1D1D1F' }}>Explorar prendas</span>
          <ChevronRight size={18} style={{ color: '#AEAEB2' }} />
        </Link>
        <Link href="/map" className="flex items-center justify-between px-5 h-[52px]">
          <span style={{ fontSize: '15px', color: '#1D1D1F' }}>Ver mapa de locales</span>
          <ChevronRight size={18} style={{ color: '#AEAEB2' }} />
        </Link>
      </div>

      {/* Sign out */}
      <div className="mx-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 h-[52px] rounded-[16px] transition-colors active:scale-[0.99]"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <LogOut size={18} style={{ color: '#FF3B30' }} />
          <span style={{ fontSize: '15px', color: '#FF3B30', fontWeight: 600 }}>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
