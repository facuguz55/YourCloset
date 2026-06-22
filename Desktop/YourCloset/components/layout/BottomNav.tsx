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
  const { dark } = useDarkMode()

  // iOS 26 Liquid Glass: specular highlight en borde superior = rasgo definitorio
  const navBg = dark
    ? 'rgba(22, 22, 24, 0.78)'
    : 'rgba(248, 248, 252, 0.78)'

  const navBorder = dark
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.08)'

  // El inset superior (1.5px blanco) ES el specular de liquid glass
  const navShadow = dark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.38), inset 0 -0.5px 0 rgba(255,255,255,0.05), 0 -4px 48px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.10)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.92), inset 0 -0.5px 0 rgba(0,0,0,0.04), 0 -2px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)'

  // Pill activa: glass elevado con su propio specular
  const pillBg = dark
    ? 'rgba(52, 52, 56, 0.88)'
    : 'rgba(255,255,255,0.92)'

  const pillBorder = dark
    ? 'rgba(255,255,255,0.16)'
    : 'rgba(0,0,0,0.06)'

  const pillShadow = dark
    ? 'inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 10px rgba(0,0,0,0.45)'
    : 'inset 0 1px 0 rgba(255,255,255,1), 0 2px 8px rgba(0,0,0,0.10)'

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
          backdropFilter: 'blur(48px) saturate(200%)',
          WebkitBackdropFilter: 'blur(48px) saturate(200%)',
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
