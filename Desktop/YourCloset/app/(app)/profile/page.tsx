'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Bookmark, MapPin, Search, Sliders, Store, LogOut, ChevronRight, Pencil, BadgeCheck } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'
import type { User } from '@supabase/supabase-js'
import type { ProductWithStore } from '@/lib/types'

type Tab = 'perfil' | 'guardado'

function AvatarPlaceholder({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="rgba(0,113,227,0.12)" />
      <circle cx="40" cy="32" r="13" fill="rgba(0,113,227,0.35)" />
      <path d="M12 74 Q13 54 40 54 Q67 54 68 74" fill="rgba(0,113,227,0.35)" />
    </svg>
  )
}

function SavedProductCard({ product, dark }: { product: ProductWithStore; dark: boolean }) {
  const img = product.image_urls?.[0]
  const skeletonBg = dark ? '#2C2C2E' : '#E5E5EA'
  const cardBg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#8E8E93'

  return (
    <a href={`/store/${product.store.slug}`} className="block active:scale-[0.97] transition-transform duration-150">
      <div className="rounded-[12px] overflow-hidden" style={{ aspectRatio: '3/4', backgroundColor: skeletonBg, position: 'relative' }}>
        {img && (
          <Image src={img} alt={product.name} fill sizes="120px" className="object-cover" />
        )}
      </div>
      <p className="truncate mt-1.5 font-medium" style={{ fontSize: '12px', color: textPrimary }}>{product.name}</p>
      <p className="truncate" style={{ fontSize: '11px', color: textSecondary }}>{product.store.name}</p>
    </a>
  )
}

function ProfileSkeleton({ dark }: { dark: boolean }) {
  const card = dark ? '#1C1C1E' : '#FFFFFF'
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: dark ? '#000000' : '#F2F2F7' }}>
      <div className="h-52 mx-4 mt-6 rounded-[20px]" style={{ backgroundColor: card }} />
      <div className="h-32 mx-4 mt-3 rounded-[20px]" style={{ backgroundColor: card }} />
    </div>
  )
}

const NAV_ROWS = [
  { icon: Sliders, label: 'Tu estilo', sub: 'Personalizá tu feed', href: '/profile/style', color: '#0071E3' },
  { icon: Search, label: 'Explorar prendas', sub: 'Buscá lo que querés', href: '/search', color: '#34C759' },
  { icon: MapPin, label: 'Mapa de locales', sub: 'Ver la ciudad', href: '/map', color: '#FF9500' },
]

export default function ProfilePage() {
  const router = useRouter()
  const { dark, toggle } = useDarkMode()
  const [user, setUser] = useState<User | null>(null)
  const [styleSummary, setStyleSummary] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [tab, setTab] = useState<Tab>('perfil')
  const [savedProducts, setSavedProducts] = useState<ProductWithStore[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedLoaded, setSavedLoaded] = useState(false)
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

  useEffect(() => {
    if (tab !== 'guardado' || savedLoaded) return
    setSavedLoading(true)
    fetch('/api/user/saved?limit=40')
      .then((r) => r.json())
      .then(({ data }) => { setSavedProducts(data ?? []); setSavedLoaded(true) })
      .catch(() => setSavedLoaded(true))
      .finally(() => setSavedLoading(false))
  }, [tab, savedLoaded])

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
  const isStoreOwner = (user?.app_metadata?.role as string) === 'store_owner' || (user?.user_metadata?.role as string) === 'store_owner'
  const isVerified = (user?.app_metadata?.role as string) === 'admin'

  const cardBg = dark ? '#1C1C1E' : '#FFFFFF'
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const cardShadow = dark ? 'none' : '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)'
  const textPrimary = dark ? '#FFFFFF' : '#000000'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const divider = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const skeletonBg = dark ? '#2C2C2E' : '#E5E5EA'

  const glass: React.CSSProperties = {
    backgroundColor: cardBg,
    border: `0.5px solid ${cardBorder}`,
    boxShadow: cardShadow,
    borderRadius: '20px',
  }

  const tabActive: React.CSSProperties = {
    borderBottom: `2px solid ${accentColor}`,
    color: accentColor,
    fontWeight: 600,
  }
  const tabInactive: React.CSSProperties = {
    borderBottom: '2px solid transparent',
    color: textSecondary,
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
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggle}
          className="flex items-center justify-center"
          style={{ width: 36, height: 22, borderRadius: 11, background: dark ? '#0A84FF' : '#D1D1D6', transition: 'background 0.25s', position: 'relative' }}
          aria-label="Alternar modo oscuro"
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

      {/* Tabs */}
      <div
        className="sticky flex border-b"
        style={{ top: '56px', zIndex: 9, background: dark ? 'rgba(10,10,12,0.92)' : 'rgba(248,248,252,0.92)', backdropFilter: 'blur(20px)', borderColor: divider }}
      >
        {([['perfil', 'Perfil'], ['guardado', 'Guardado']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 py-3 text-[14px]"
            style={tab === key ? tabActive : tabInactive}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'perfil' ? (
        <div className="px-4 pt-5 pb-28 space-y-3 max-w-lg mx-auto">
          {/* Avatar card */}
          <div style={{ ...glass, padding: '24px 20px' }}>
            <div className="flex items-center gap-4">
              <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden flex-none"
                style={{ border: '2.5px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  : <AvatarPlaceholder size={72} />}
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
                      style={{ fontSize: '17px', color: textPrimary, borderColor: accentColor }}
                    />
                    <button onClick={handleSaveName} disabled={savingName}
                      className="px-2.5 py-1 rounded-[8px] text-white text-[12px] font-bold"
                      style={{ background: accentColor }}>
                      {savingName ? '...' : 'OK'}
                    </button>
                    <button onClick={() => setEditingName(false)} style={{ color: textSecondary, fontSize: '12px' }}>
                      <span aria-label="Cancelar">✕</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5">
                    <span className="font-bold truncate" style={{ fontSize: '20px', color: textPrimary }}>{name}</span>
                    {isVerified && <BadgeCheck size={16} strokeWidth={1.5} color={accentColor} />}
                    <Pencil size={12} strokeWidth={1.5} color={textSecondary} />
                  </button>
                )}
                <p className="truncate mt-0.5" style={{ fontSize: '13px', color: textSecondary }}>{email}</p>
                {styleSummary.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {styleSummary.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
                        style={{ background: 'rgba(0,113,227,0.15)', color: accentColor }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Editar gustos */}
            <a
              href="/profile/style"
              className="flex items-center justify-between mt-4 pt-4"
              style={{ borderTop: `0.5px solid ${divider}` }}
            >
              <span style={{ fontSize: '14px', color: textSecondary }}>Editar mis gustos</span>
              <ChevronRight size={16} strokeWidth={1.5} color={textSecondary} />
            </a>
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
                <Store size={20} strokeWidth={1.5} color="white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white" style={{ fontSize: '15px' }}>Panel de mi local</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Gestionar prendas y estadísticas</p>
              </div>
              <ChevronRight size={16} strokeWidth={1.5} color="rgba(255,255,255,0.7)" />
            </motion.a>
          )}

          {/* Nav rows */}
          <div style={{ ...glass, padding: '4px 0', overflow: 'hidden' }}>
            {NAV_ROWS.map((row, i, arr) => {
              const Icon = row.icon
              return (
                <motion.a
                  key={row.href}
                  href={row.href}
                  whileTap={{ scale: 0.98, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                  className="flex items-center gap-4 px-5"
                  style={{ height: '62px', borderBottom: i < arr.length - 1 ? `0.5px solid ${divider}` : 'none', display: 'flex' }}
                >
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-none"
                    style={{ background: `${row.color}18`, color: row.color }}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium" style={{ fontSize: '15px', color: textPrimary }}>{row.label}</p>
                    <p style={{ fontSize: '12px', color: textSecondary }}>{row.sub}</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} color={textSecondary} />
                </motion.a>
              )
            })}
          </div>

          {/* Sign out */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-[20px]"
            style={{ ...glass, height: '52px', color: '#FF3B30', fontSize: '15px', fontWeight: 600 }}
          >
            <LogOut size={18} strokeWidth={1.5} color="#FF3B30" />
            Cerrar sesión
          </motion.button>
        </div>
      ) : (
        /* Tab Guardado */
        <div className="px-4 pt-5 pb-28 max-w-lg mx-auto">
          {savedLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i}>
                  <div className="rounded-[12px] animate-pulse" style={{ aspectRatio: '3/4', backgroundColor: skeletonBg }} />
                  <div className="h-2.5 rounded-full animate-pulse mt-1.5 w-3/4" style={{ backgroundColor: skeletonBg }} />
                </div>
              ))}
            </div>
          ) : savedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4" style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                <Bookmark size={28} strokeWidth={1.5} color={textSecondary} />
              </div>
              <p className="font-semibold" style={{ fontSize: '17px', color: textPrimary }}>Sin guardados todavía</p>
              <p className="mt-1" style={{ fontSize: '15px', color: textSecondary }}>Guardá prendas desde el feed para verlas acá.</p>
              <a
                href="/home"
                className="mt-6 px-6 py-3 rounded-[12px] font-semibold"
                style={{ backgroundColor: accentColor, color: '#FFFFFF', fontSize: '15px' }}
              >
                Ir al feed
              </a>
            </div>
          ) : (
            <>
              <p className="mb-3" style={{ fontSize: '13px', color: textSecondary }}>{savedProducts.length} prenda{savedProducts.length !== 1 ? 's' : ''} guardada{savedProducts.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-3 gap-2">
                {savedProducts.map((p) => (
                  <SavedProductCard key={p.id} product={p as ProductWithStore} dark={dark} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
