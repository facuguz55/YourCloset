'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Users, Store, Flag, Sliders, Home } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

const NAV = [
  { href: '/founders', label: 'Stats', icon: BarChart2 },
  { href: '/founders/users', label: 'Usuarios', icon: Users },
  { href: '/founders/stores', label: 'Locales', icon: Store },
  { href: '/founders/reports', label: 'Reportes', icon: Flag },
  { href: '/founders/algorithm', label: 'Algoritmo', icon: Sliders },
]

export default function FoundersLayout({ children }: { children: React.ReactNode }) {
  const { dark } = useDarkMode()
  const pathname = usePathname()

  const bg = dark ? '#000000' : '#F2F2F7'
  const sidebarBg = dark ? '#1C1C1E' : '#FFFFFF'
  const textPrimary = dark ? '#FFFFFF' : '#1D1D1F'
  const textSecondary = dark ? '#8E8E93' : '#6E6E73'
  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const divider = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: bg }}>
      {/* Sidebar desktop / bottom bar mobile */}
      <aside
        className="hidden md:flex flex-col w-56 flex-none sticky top-0 h-screen"
        style={{ backgroundColor: sidebarBg, borderRight: `0.5px solid ${divider}` }}
      >
        <div className="px-5 pt-6 pb-4 border-b" style={{ borderColor: divider }}>
          <p className="font-bold" style={{ fontSize: '17px', color: textPrimary }}>Founders</p>
          <p style={{ fontSize: '11px', color: textSecondary }}>Panel de control</p>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/founders' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-5 py-3 transition-colors"
                style={{
                  backgroundColor: active ? `${accentColor}15` : 'transparent',
                  borderLeft: active ? `3px solid ${accentColor}` : '3px solid transparent',
                  color: active ? accentColor : textSecondary,
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: divider }}>
          <Link href="/home" className="flex items-center gap-2" style={{ fontSize: '13px', color: textSecondary }}>
            <Home size={14} strokeWidth={1.5} />
            Volver al app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
          {children}
        </div>
      </main>

      {/* Bottom nav mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex md:hidden"
        style={{ backgroundColor: sidebarBg, borderTop: `0.5px solid ${divider}`, paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/founders' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center py-2 gap-0.5"
              style={{ color: active ? accentColor : textSecondary, fontSize: '10px' }}
            >
              <Icon size={20} strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
