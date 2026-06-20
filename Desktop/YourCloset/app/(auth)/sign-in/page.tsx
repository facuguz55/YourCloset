'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }
    router.push('/home')
    router.refresh()
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="space-y-6">
      {/* Logo / Header */}
      <div className="text-center space-y-1">
        <h1 className="font-bold" style={{ fontSize: '28px', color: '#1D1D1F' }}>
          YourCloset
        </h1>
        <p style={{ fontSize: '15px', color: '#6E6E73' }}>Ingresá a tu cuenta</p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 transition-colors active:scale-[0.99]"
        style={{
          height: '44px',
          borderRadius: '12px',
          backgroundColor: '#F5F5F7',
          color: '#1D1D1F',
          fontSize: '15px',
          fontWeight: 500,
          border: '1px solid #D2D2D7',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        Continuar con Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: '#D2D2D7' }} />
        <span style={{ fontSize: '13px', color: '#AEAEB2' }}>o</span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#D2D2D7' }} />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailSignIn} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 outline-none"
          style={{
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#F5F5F7',
            fontSize: '15px',
            color: '#1D1D1F',
            border: '1px solid transparent',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#D2D2D7')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 outline-none"
          style={{
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#F5F5F7',
            fontSize: '15px',
            color: '#1D1D1F',
            border: '1px solid transparent',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#D2D2D7')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
        />

        {error && (
          <p style={{ fontSize: '13px', color: '#FF3B30' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full font-semibold transition-colors disabled:opacity-60"
          style={{
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#0071E3',
            color: '#FFFFFF',
            fontSize: '15px',
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-center" style={{ fontSize: '13px', color: '#6E6E73' }}>
        ¿No tenés cuenta?{' '}
        <Link href="/sign-up" style={{ color: '#0071E3', fontWeight: 600 }}>
          Registrate
        </Link>
      </p>
    </div>
  )
}
