'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Search, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Inicio' },
  { href: '/map', icon: Map, label: 'Mapa' },
  { href: '/search', icon: Search, label: 'Buscar' },
  { href: '/profile', icon: User, label: 'Mi perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.58) 100%)',
        backdropFilter: 'blur(48px) saturate(220%) brightness(1.08)',
        WebkitBackdropFilter: 'blur(48px) saturate(220%) brightness(1.08)',
        borderTop: '1px solid rgba(255,255,255,0.65)',
        borderLeft: '0.5px solid rgba(255,255,255,0.4)',
        borderRight: '0.5px solid rgba(255,255,255,0.4)',
        borderRadius: '28px 28px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        minHeight: '64px',
        boxShadow: '0 -1px 0 rgba(255,255,255,0.9) inset, 0 -8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-2 transition-all duration-200 ease-out"
            style={{ minHeight: '44px' }}
          >
            <Icon
              size={22}
              style={{ color: isActive ? '#0071E3' : '#6E6E73' }}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? '#0071E3' : '#6E6E73' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
