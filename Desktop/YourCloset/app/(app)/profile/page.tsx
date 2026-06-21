'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// ── SVG icons ────────────────────────────────────────────────────────────────

function AvatarSVG({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="rgba(0,113,227,0.12)" />
      <circle cx="40" cy="32" r="13" fill="rgba(0,113,227,0.35)" />
      <path d="M12 74 Q13 54 40 54 Q67 54 68 74" fill="rgba(0,113,227,0.35)" />
    </svg>
  )
}

function ChevronSVG({ color = '#AEAEB2' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

const NAV_ROWS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 7l-4-4H8L4 7l3 2V20h10V9l3-2z"/>
        <path d="M8 3c0 2 1.5 3 4 3s4-1 4-3"/>
      </svg>
    ),
    label: 'Tu estilo', sub: 'Personalizá tu feed', href: '/profile/style', color: '#0071E3',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    label: 'Explorar prendas', sub: 'Buscá lo que querés', href: '/search', color: '#34C759',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    label: 'Mapa de locales', sub: 'Ver la ciudad', href: '/map', color: '#FF9500',
  },
]

const STORE_ROWS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    label: 'Mi local', sub: 'Gestionar mi tienda', href: '/dashboard', color: '#AF52DE',
  },
]

// ── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton({ dark }: { dark: boolean }) {
  const card = dark ? '#1C1C1E' : '#FFFFFF'
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: dark ? '#000000' : '#F2F2F7' }}>
      <div className="h-52 mx-4 mt-6 rounded-[20px]" style={{ backgroundColor: card }} />
      <div className="h-32 mx-4 mt-3 rounded-[20px]" style={{ backgroundColor: card }} />
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function useDarkMode() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const stored = localStorage.getItem('yc-theme')
    const isDark = stored === 'dark'
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])
  function toggle() {
    const next = !dark
    setDark(next)
    localStorage.setItem('yc-theme', next ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  }
  return { dark, toggle }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const { dark, toggle } = useDarkMode()
  const [user, setUser] = useState<User | null>(null)
  const [styleSummary, setStyleSummary] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [savingName, setSavingName] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setNameVal((user?.user_metadata?.full_name as string) || '')
      const res = await fetch('/api/user/style-profile')
      if (res.ok) {
        const { data } = await res.json()
        setStyleSummary(data?.style_profile?.estilos ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveName() {
    if (!nameVal.trim()) return
    setSavingName(true)
    await supabase.auth.updateUser({ data: { full_name: nameVal.trim() } })
    setEditingName(false)
    setSavingName(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  if (loading) return <ProfileSkeleton dark={dark} />

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Usuario'
  const email = user?.email ?? ''
  const isStoreOwner = (user?.user_metadata?.role as string) === 'store_owner'

  // Apple HIG tokens: sin gradientes de color, grises neutros
  const cardBg = dark ? '#1C1C1E' : '#FFFFFF'
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const cardShadow = dark ? 'none' : '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)'
  const textPrimary = dark ? '#FFFFFF' : '#000000'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const divider = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const glass: React.CSSProperties = {
    backgroundColor: cardBg,
    border: `0.5px solid ${cardBorder}`,
    boxShadow: cardShadow,
    borderRadius: '20px',
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: dark ? '#000000' : '#F2F2F7' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 flex items-center justify-between"
        style={{
          height: '56px',
          paddingTop: 'env(safe-area-inset-top)',
          background: dark ? 'rgba(10,10,12,0.82)' : 'rgba(248,248,252,0.82)',
          backdropFilter: 'blur(48px) saturate(200%)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%)',
          borderBottom: `0.5px solid ${cardBorder}`,
          boxShadow: dark
            ? 'inset 0 -1px 0 rgba(255,255,255,0.07), 0 4px 32px rgba(0,0,0,0.35)'
            : 'inset 0 -1px 0 rgba(255,255,255,0.60), 0 4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <h1 className="font-bold" style={{ fontSize: '20px', color: textPrimary }}>Mi perfil</h1>
        {/* Dark mode toggle */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggle}
          className="flex items-center justify-center"
          style={{
            width: 36, height: 22, borderRadius: 11,
            background: dark ? '#0A84FF' : '#D1D1D6',
            transition: 'background 0.25s',
            position: 'relative',
          }}
        >
          <motion.div
            layout
            style={{
              width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF',
              position: 'absolute',
              left: dark ? 'calc(100% - 20px)' : '2px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              transition: 'left 0.25s',
            }}
          />
        </motion.button>
      </div>

      <div className="px-4 pt-5 pb-28 space-y-3 max-w-lg mx-auto">

        {/* Avatar card */}
        <div style={{ ...glass, padding: '24px 20px' }}>
          <div className="flex items-center gap-4">
            <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden flex-none"
              style={{ border: '2.5px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                : <AvatarSVG size={72} />}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                    className="flex-1 bg-transparent outline-none border-b-2 font-semibold"
                    style={{ fontSize: '17px', color: textPrimary, borderColor: '#0071E3' }}
                  />
                  <button onClick={handleSaveName} disabled={savingName}
                    className="px-2.5 py-1 rounded-[8px] text-white text-[12px] font-bold"
                    style={{ background: '#0071E3' }}>
                    {savingName ? '...' : 'OK'}
                  </button>
                  <button onClick={() => setEditingName(false)} style={{ color: textSecondary, fontSize: '12px' }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5">
                  <span className="font-bold truncate" style={{ fontSize: '20px', color: textPrimary }}>{name}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                  </svg>
                </button>
              )}
              <p className="truncate mt-0.5" style={{ fontSize: '13px', color: textSecondary }}>{email}</p>
              {styleSummary.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {styleSummary.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
                      style={{ background: 'rgba(0,113,227,0.15)', color: '#0071E3' }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store owner banner */}
        {isStoreOwner && (
          <motion.a
            href="/dashboard"
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-5 py-4 rounded-[20px]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,113,227,0.85) 0%, rgba(0,85,184,0.85) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 4px 20px rgba(0,113,227,0.35)',
              display: 'flex',
            }}
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-none" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white" style={{ fontSize: '15px' }}>Panel de mi local</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Gestionar prendas y estadísticas</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
          </motion.a>
        )}

        {/* Nav rows */}
        <div style={{ ...glass, padding: '4px 0', overflow: 'hidden' }}>
          {[...NAV_ROWS, ...(isStoreOwner ? [] : [])].map((row, i, arr) => (
            <motion.a
              key={row.href}
              href={row.href}
              whileTap={{ scale: 0.98, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
              className="flex items-center gap-4 px-5"
              style={{
                height: '62px',
                borderBottom: i < arr.length - 1 ? `0.5px solid ${divider}` : 'none',
                display: 'flex',
              }}
            >
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-none"
                style={{ background: `${row.color}18`, color: row.color }}>
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ fontSize: '15px', color: textPrimary }}>{row.label}</p>
                <p style={{ fontSize: '12px', color: textSecondary }}>{row.sub}</p>
              </div>
              <ChevronSVG color={textSecondary} />
            </motion.a>
          ))}
        </div>

        {/* Sign out */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 rounded-[20px]"
          style={{
            ...glass,
            height: '52px',
            color: '#FF3B30',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </motion.button>
      </div>
    </div>
  )
}
