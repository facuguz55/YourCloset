'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// ── SVG Components ──────────────────────────────────────────────────────────

function AvatarSVG({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#E5E5EA" />
      <circle cx="40" cy="32" r="13" fill="#C7C7CC" />
      <path d="M12 74 Q13 54 40 54 Q67 54 68 74" fill="#C7C7CC" />
    </svg>
  )
}

function ChevronRightSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function EditSVG() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function LogOutSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function StoreSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function CheckSVG() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── Style & preference data ──────────────────────────────────────────────────

function StyleIcon({ value }: { value: string }) {
  const icons: Record<string, JSX.Element> = {
    streetwear: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 3C9 3 6 5 6 8h12c0-3-3-5-6-5z" />
        <rect x="4" y="8" width="16" height="2" rx="1" />
        <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
    casual: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 7l-4-4H8L4 7l3 2V20h10V9l3-2z" />
        <path d="M8 3c0 2 1.5 3 4 3s4-1 4-3" />
      </svg>
    ),
    formal: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 3L6 7l6 2 6-2-3-4" />
        <path d="M12 9v12" />
        <path d="M9 12l3 2 3-2" />
        <path d="M5 7v13h14V7" />
      </svg>
    ),
    sport: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    bohemio: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2a5 5 0 0 1 0 10 5 5 0 0 1 0-10z" opacity=".3" />
        <path d="M12 9c1.5-2 4-3 4-5" />
        <path d="M12 9c-1.5-2-4-3-4-5" />
        <path d="M12 15c1.5 2 4 3 4 5" />
        <path d="M12 15c-1.5 2-4 3-4 5" />
      </svg>
    ),
    minimalista: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="5" y1="8" x2="14" y2="8" />
        <line x1="5" y1="16" x2="10" y2="16" />
      </svg>
    ),
  }
  return icons[value] ?? null
}

const STYLES = [
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'sport', label: 'Sport' },
  { value: 'bohemio', label: 'Bohemio' },
  { value: 'minimalista', label: 'Minimalista' },
]

const GENDERS = [
  { value: 'femenino', label: 'Mujer' },
  { value: 'masculino', label: 'Hombre' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'sin_preferencia', label: 'Sin preferencia' },
]

const PRICES = [
  { value: 'economico', label: 'Económico' },
  { value: 'medio', label: 'Intermedio' },
  { value: 'premium', label: 'Premium' },
]

// ── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="px-4 pt-5 pb-4" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="h-7 w-28 rounded-lg" style={{ backgroundColor: '#E5E5EA' }} />
      </div>
      <div className="px-4 py-6 flex items-center gap-4" style={{ backgroundColor: '#FFFFFF', marginBottom: 8 }}>
        <div className="w-20 h-20 rounded-full" style={{ backgroundColor: '#E5E5EA' }} />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-lg" style={{ backgroundColor: '#E5E5EA' }} />
          <div className="h-4 w-44 rounded-lg" style={{ backgroundColor: '#F5F5F7' }} />
        </div>
      </div>
      <div className="mx-4 mb-4 h-40 rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }} />
      <div className="mx-4 mb-4 h-24 rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }} />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

type StyleProfile = {
  estilos?: string[]
  genero?: string
  precio_rango?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [styleProfile, setStyleProfile] = useState<StyleProfile>({})
  const [loading, setLoading] = useState(true)

  // Edit states
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [savingName, setSavingName] = useState(false)

  // Style editor
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState('sin_preferencia')
  const [selectedPrice, setSelectedPrice] = useState('medio')
  const [styleChanged, setStyleChanged] = useState(false)
  const [savingStyle, setSavingStyle] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setNameVal((user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || '')
      if (user) {
        const res = await fetch('/api/user/style-profile')
        if (res.ok) {
          const { data } = await res.json()
          if (data?.style_profile) {
            const sp = data.style_profile as StyleProfile
            setStyleProfile(sp)
            setSelectedStyles(sp.estilos ?? [])
            setSelectedGender(sp.genero ?? 'sin_preferencia')
            setSelectedPrice(sp.precio_rango ?? 'medio')
          }
        }
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

  function toggleStyle(val: string) {
    setSelectedStyles((prev) => {
      const next = prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
      setStyleChanged(true)
      return next
    })
  }

  async function handleSaveStyle() {
    if (selectedStyles.length === 0) return
    setSavingStyle(true)
    await fetch('/api/user/style-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estilos: selectedStyles, genero: selectedGender, precio_rango: selectedPrice }),
    })
    setStyleChanged(false)
    setSavingStyle(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  if (loading) return <ProfileSkeleton />

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Usuario'
  const email = user?.email ?? ''
  const isStoreOwner = (user?.user_metadata?.role as string) === 'store_owner'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Header */}
      <div
        className="px-4"
        style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: '16px', backgroundColor: '#FFFFFF' }}
      >
        <h1 className="font-bold" style={{ fontSize: '24px', color: '#1D1D1F' }}>Mi perfil</h1>
      </div>

      {/* Avatar + info + edit name */}
      <div
        className="px-4 py-5 flex items-center gap-4"
        style={{ backgroundColor: '#FFFFFF', borderBottom: '0.5px solid #F2F2F7', marginBottom: '8px' }}
      >
        <div className="relative w-20 h-20 rounded-full overflow-hidden flex-none">
          {avatarUrl
            ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            : <AvatarSVG size={80} />}
        </div>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                className="flex-1 outline-none font-semibold border-b-2 bg-transparent"
                style={{ fontSize: '17px', color: '#1D1D1F', borderColor: '#0071E3' }}
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="px-3 py-1 rounded-[8px] text-white text-[13px] font-semibold"
                style={{ backgroundColor: '#0071E3' }}
              >
                {savingName ? '...' : 'OK'}
              </button>
              <button onClick={() => setEditingName(false)} style={{ color: '#AEAEB2', fontSize: '13px' }}>
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 group"
            >
              <span className="font-bold truncate" style={{ fontSize: '20px', color: '#1D1D1F' }}>{name}</span>
              <span style={{ color: '#AEAEB2' }} className="opacity-60 group-hover:opacity-100 transition-opacity">
                <EditSVG />
              </span>
            </button>
          )}
          <p className="truncate mt-0.5" style={{ fontSize: '13px', color: '#6E6E73' }}>{email}</p>
        </div>
      </div>

      {/* Store owner section */}
      {isStoreOwner && (
        <div
          className="mx-4 mb-3 p-5 rounded-[16px] flex items-center justify-between"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: '#EBF4FF', color: '#0071E3' }}>
              <StoreSVG />
            </div>
            <div>
              <p className="font-semibold" style={{ fontSize: '15px', color: '#1D1D1F' }}>Mi local</p>
              <p style={{ fontSize: '13px', color: '#6E6E73' }}>Crear o gestionar tu tienda</p>
            </div>
          </div>
          <a href="/dashboard" className="flex items-center gap-1 font-semibold" style={{ fontSize: '13px', color: '#0071E3' }}>
            Gestionar <ChevronRightSVG />
          </a>
        </div>
      )}

      {/* Tu estilo */}
      <div className="mx-4 mb-3 p-5 rounded-[16px]" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ fontSize: '17px', color: '#1D1D1F' }}>Tu estilo</h2>
          <AnimatePresence>
            {styleChanged && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleSaveStyle}
                disabled={savingStyle || selectedStyles.length === 0}
                className="px-4 py-1.5 rounded-[10px] text-white text-[13px] font-semibold"
                style={{ backgroundColor: '#0071E3' }}
              >
                {savingStyle ? 'Guardando...' : 'Guardar'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Estilos */}
        <p className="mb-2" style={{ fontSize: '12px', color: '#AEAEB2', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Estilos</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {STYLES.map(({ value, label }) => {
            const active = selectedStyles.includes(value)
            return (
              <motion.button
                key={value}
                whileTap={{ scale: 0.94 }}
                onClick={() => toggleStyle(value)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-[14px] transition-colors relative"
                style={{
                  backgroundColor: active ? '#EBF4FF' : '#F5F5F7',
                  border: `1.5px solid ${active ? '#0071E3' : 'transparent'}`,
                  color: active ? '#0071E3' : '#6E6E73',
                }}
              >
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0071E3', color: '#fff' }}>
                    <CheckSVG />
                  </div>
                )}
                <StyleIcon value={value} />
                <span style={{ fontSize: '11px', fontWeight: 600 }}>{label}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Género */}
        <p className="mb-2" style={{ fontSize: '12px', color: '#AEAEB2', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Género</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {GENDERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setSelectedGender(value); setStyleChanged(true) }}
              className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors"
              style={{
                backgroundColor: selectedGender === value ? '#0071E3' : '#F5F5F7',
                color: selectedGender === value ? '#FFFFFF' : '#6E6E73',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Precio */}
        <p className="mb-2" style={{ fontSize: '12px', color: '#AEAEB2', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Precio</p>
        <div className="flex gap-2">
          {PRICES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setSelectedPrice(value); setStyleChanged(true) }}
              className="flex-1 py-2 rounded-[10px] text-[13px] font-medium transition-colors"
              style={{
                backgroundColor: selectedPrice === value ? '#0071E3' : '#F5F5F7',
                color: selectedPrice === value ? '#FFFFFF' : '#6E6E73',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="mx-4 mb-3 rounded-[16px] overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        <a href="/search" className="flex items-center justify-between px-5 h-[52px]" style={{ borderBottom: '0.5px solid #F2F2F7' }}>
          <span style={{ fontSize: '15px', color: '#1D1D1F' }}>Explorar prendas</span>
          <ChevronRightSVG />
        </a>
        <a href="/map" className="flex items-center justify-between px-5 h-[52px]">
          <span style={{ fontSize: '15px', color: '#1D1D1F' }}>Ver mapa de locales</span>
          <ChevronRightSVG />
        </a>
      </div>

      {/* Sign out */}
      <div className="mx-4 mb-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 h-[52px] rounded-[16px] active:scale-[0.98] transition-transform"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <LogOutSVG />
          <span style={{ fontSize: '15px', color: '#FF3B30', fontWeight: 600 }}>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
