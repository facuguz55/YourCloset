'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('yc-theme')
    const isDark = stored === 'dark'
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')

    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="min-h-screen"
      style={{
        background: dark
          ? `
            radial-gradient(ellipse at 25% 20%, rgba(50,60,180,0.22) 0%, transparent 55%),
            radial-gradient(ellipse at 75% 80%, rgba(120,50,200,0.16) 0%, transparent 55%),
            linear-gradient(160deg, #060610 0%, #0C0B22 35%, #090C1E 65%, #060608 100%)
          `
          : `
            radial-gradient(ellipse at 20% 30%, rgba(100,150,255,0.30) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 70%, rgba(200,140,255,0.22) 0%, transparent 55%),
            linear-gradient(160deg, #E5EEFF 0%, #EDE6FF 40%, #F5E5FF 70%, #FFF2FA 100%)
          `,
        paddingBottom: '96px',
        minHeight: '100dvh',
      }}
    >
      {children}
      <BottomNav />
    </div>
  )
}
