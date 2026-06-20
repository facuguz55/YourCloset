'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Search, User } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Inicio' },
  { href: '/map', icon: Map, label: 'Mapa' },
  { href: '/search', icon: Search, label: 'Buscar' },
  { href: '/profile', icon: User, label: 'Mi perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))', padding: '0 16px max(16px, env(safe-area-inset-bottom, 16px))' }}
    >
      <nav
        className="flex items-center justify-around w-full max-w-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.35) 100%)',
          backdropFilter: 'blur(40px) saturate(180%) brightness(1.12)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(1.12)',
          border: '1px solid rgba(255,255,255,0.60)',
          borderRadius: '28px',
          boxShadow: '0 2px 0 rgba(255,255,255,0.85) inset, 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          height: '64px',
          padding: '0 8px',
        }}
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full">
              <motion.div
                className="flex flex-col items-center justify-center gap-1 w-full py-2"
                whileTap={{ scale: 0.80 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-x-1"
                    style={{
                      height: '48px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.45) 100%)',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px rgba(0,0,0,0.06)',
                      border: '0.5px solid rgba(255,255,255,0.8)',
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
                    style={{ color: isActive ? '#0071E3' : 'rgba(110,110,115,0.75)' }}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </motion.div>
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.65 }}
                  className="relative z-10 text-[10px] font-medium"
                  style={{ color: isActive ? '#0071E3' : '#6E6E73' }}
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
