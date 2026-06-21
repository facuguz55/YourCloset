'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Search, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Inicio' },
  { href: '/map', icon: Map, label: 'Mapa' },
  { href: '/search', icon: Search, label: 'Buscar' },
  { href: '/profile', icon: User, label: 'Mi perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const dark = useDarkMode()

  // Apple HIG: dark glass = #1C1C1E con blur, light glass = blanco con blur
  const navBg = dark
    ? 'rgba(28, 28, 30, 0.82)'
    : 'rgba(242, 242, 247, 0.82)'

  const navBorder = dark
    ? 'rgba(255,255,255,0.10)'
    : 'rgba(0,0,0,0.10)'

  const navShadow = dark
    ? '0 1px 0 rgba(255,255,255,0.07) inset, 0 -1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.6)'
    : '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 24px rgba(0,0,0,0.10), 0 1px 0 rgba(0,0,0,0.06)'

  // Pill activa: más claro que el nav en dark, más blanco en light
  const pillBg = dark
    ? 'rgba(58, 58, 60, 0.90)'
    : 'rgba(255,255,255,0.90)'

  const pillBorder = dark
    ? 'rgba(255,255,255,0.14)'
    : 'rgba(0,0,0,0.08)'

  const pillShadow = dark
    ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 8px rgba(0,0,0,0.4)'
    : '0 1px 0 rgba(255,255,255,1) inset, 0 2px 6px rgba(0,0,0,0.08)'

  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const inactiveColor = dark ? '#636366' : '#8E8E93'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ padding: '0 16px max(20px, env(safe-area-inset-bottom, 20px))' }}
    >
      <nav
        className="flex items-center justify-around w-full max-w-sm"
        style={{
          background: navBg,
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: `0.5px solid ${navBorder}`,
          borderRadius: '28px',
          boxShadow: navShadow,
          height: '64px',
          padding: '0 6px',
        }}
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <motion.div
                className="flex flex-col items-center justify-center gap-0.5 w-full py-2"
                whileTap={{ scale: 0.80 }}
                transition={{ type: 'spring', stiffness: 600, damping: 24 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-x-0.5"
                    style={{
                      height: '48px',
                      borderRadius: '20px',
                      background: pillBg,
                      boxShadow: pillShadow,
                      border: `0.5px solid ${pillBorder}`,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.7 }}
                  />
                )}
                <motion.div
                  animate={{ y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="relative z-10"
                >
                  <Icon
                    size={22}
                    style={{ color: isActive ? accentColor : inactiveColor }}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </motion.div>
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.65 }}
                  className="relative z-10 font-medium"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.01em',
                    color: isActive ? accentColor : inactiveColor,
                  }}
                >
                  {label}
                </motion.span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
