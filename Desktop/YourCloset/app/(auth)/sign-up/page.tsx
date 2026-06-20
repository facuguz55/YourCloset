'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type Role = 'user' | 'store_owner'

const ROLES: { value: Role; label: string; sub: string }[] = [
  { value: 'user', label: 'Comprador', sub: 'Explorá locales' },
  { value: 'store_owner', label: 'Soy un local', sub: 'Mostrá tu negocio' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

const STORE_CODE = 'LOCAL2025'

export default function SignUpPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [storeCode, setStoreCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (role === 'store_owner' && storeCode.trim().toUpperCase() !== STORE_CODE) {
      setError('Código de local incorrecto. Pedíselo a YourCloset.')
      setLoading(false)
      return
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: name },
      },
    })
    if (error) {
      console.error('signUp error:', error)
      const msg = error.message || ''
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        setError('Este email ya está registrado. Ingresá desde la pantalla de inicio.')
      } else {
        setError(msg || `Error ${error.status ?? ''}: ${error.name ?? 'desconocido'}`)
      }
      setLoading(false)
      return
    }
    if (!data.session) {
      setError('Confirmación de email requerida. Desactivala en Supabase → Auth → Email confirmations.')
      setLoading(false)
      return
    }
    router.push('/home')
    router.refresh()
  }

  async function handleGoogleSignUp() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback`, queryParams: { role } },
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1 pb-1">
        <h1 className="font-bold" style={{ fontSize: '26px', color: '#1D1D1F' }}>YourCloset</h1>
        <p style={{ fontSize: '14px', color: '#6E6E73' }}>Creá tu cuenta gratis</p>
      </div>

      {/* Role selector — Liquid sliding pill */}
      <div
        className="relative flex p-1 gap-0"
        style={{
          borderRadius: '18px',
          background: 'rgba(0,0,0,0.07)',
          border: '0.5px solid rgba(255,255,255,0.4)',
        }}
      >
        {ROLES.map(({ value, label, sub }) => (
          <button
            key={value}
            onClick={() => setRole(value)}
            className="relative flex-1 py-3 flex flex-col items-center gap-0.5 z-10"
            style={{ borderRadius: '14px', minHeight: '60px' }}
          >
            {/* Sliding glass pill — renders under active tab */}
            {role === value && (
              <motion.div
                layoutId="role-pill"
                className="absolute inset-0"
                style={{
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.80) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,1) inset',
                  border: '0.5px solid rgba(255,255,255,0.9)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.7 }}
              />
            )}
            <span
              className="relative z-10 font-semibold leading-tight transition-colors duration-200"
              style={{ fontSize: '13px', color: role === value ? '#1D1D1F' : 'rgba(30,30,30,0.55)' }}
            >
              {label}
            </span>
            <span
              className="relative z-10 transition-colors duration-200"
              style={{ fontSize: '10px', color: role === value ? '#6E6E73' : 'rgba(30,30,30,0.35)' }}
            >
              {sub}
            </span>
          </button>
        ))}
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
        style={{
          height: '46px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.70)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.8)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset',
          fontSize: '15px',
          fontWeight: 500,
          color: '#1D1D1F',
        }}
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.10)' }} />
        <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.35)' }}>o con email</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.10)' }} />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailSignUp} className="space-y-2.5">
        {role === 'store_owner' && (
          <div className="flex items-center gap-2 px-4 rounded-[13px]"
            style={{ height: '46px', background: 'rgba(0,113,227,0.08)', border: '1px solid rgba(0,113,227,0.25)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type="text"
              placeholder="Código de local (pedíselo a YourCloset)"
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              required
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: '14px', color: '#0071E3' }}
            />
          </div>
        )}
        {[
          { value: name, setter: setName, placeholder: 'Nombre completo', type: 'text', required: true },
          { value: email, setter: setEmail, placeholder: 'Email', type: 'email', required: true },
          { value: password, setter: setPassword, placeholder: 'Contraseña (mín. 8 caracteres)', type: 'password', required: true, minLength: 8 },
        ].map(({ value, setter, placeholder, type, required, minLength }) => (
          <input
            key={placeholder}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setter(e.target.value)}
            required={required}
            minLength={minLength}
            className="w-full px-4 outline-none transition-all"
            style={{
              height: '46px',
              borderRadius: '13px',
              background: 'rgba(255,255,255,0.60)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '0.5px solid rgba(255,255,255,0.75)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              fontSize: '15px',
              color: '#1D1D1F',
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.85)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.18), 0 1px 4px rgba(0,0,0,0.06)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.60)'
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
            }}
          />
        ))}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: '13px', color: '#FF3B30' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full font-semibold disabled:opacity-60 transition-opacity"
          style={{
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0071E3 0%, #0055B8 100%)',
            color: '#FFFFFF',
            fontSize: '15px',
            boxShadow: '0 4px 16px rgba(0,113,227,0.35), 0 1px 0 rgba(255,255,255,0.20) inset',
            border: 'none',
          }}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </motion.button>
      </form>

      <p className="text-center" style={{ fontSize: '13px', color: '#6E6E73' }}>
        ¿Ya tenés cuenta?{' '}
        <Link href="/sign-in" style={{ color: '#0071E3', fontWeight: 600 }}>
          Ingresá
        </Link>
      </p>
    </div>
  )
}
