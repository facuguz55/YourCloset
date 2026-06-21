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

  const navBg = dark
    ? 'linear-gradient(135deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.06) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.38) 100%)'

  const navBorder = dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.65)'

  const navShadow = dark
    ? '0 2px 0 rgba(255,255,255,0.06) inset, 0 -0.5px 0 rgba(255,255,255,0.04) inset, 0 12px 48px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)'
    : '0 2px 0 rgba(255,255,255,0.88) inset, 0 -0.5px 0 rgba(255,255,255,0.40) inset, 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)'

  const pillBg = dark
    ? 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.48) 100%)'

  const pillBorder = dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.85)'

  const pillShadow = dark
    ? '0 1px 0 rgba(255,255,255,0.10) inset, 0 2px 10px rgba(0,0,0,0.3)'
    : '0 1px 0 rgba(255,255,255,0.95) inset, 0 2px 8px rgba(0,0,0,0.05)'

  const accentColor = dark ? '#0A84FF' : '#0071E3'
  const inactiveColor = dark ? 'rgba(174,174,178,0.65)' : 'rgba(110,110,115,0.72)'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ padding: '0 16px max(20px, env(safe-area-inset-bottom, 20px))' }}
    >
      <nav
        className="flex items-center justify-around w-full max-w-sm"
        style={{
          background: navBg,
          backdropFilter: 'blur(48px) saturate(200%) brightness(1.10)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%) brightness(1.10)',
          border: `1px solid ${navBorder}`,
          borderRadius: '30px',
          boxShadow: navShadow,
          height: '66px',
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
                whileTap={{ scale: 0.78 }}
                transition={{ type: 'spring', stiffness: 600, damping: 24 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-x-0.5"
                    style={{
                      height: '50px',
                      borderRadius: '22px',
                      background: pillBg,
                      boxShadow: pillShadow,
                      border: `0.5px solid ${pillBorder}`,
                    }}
                    transition={{ type: 'spring', stiffness: 540, damping: 38, mass: 0.65 }}
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
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                </motion.div>
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.6 }}
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
