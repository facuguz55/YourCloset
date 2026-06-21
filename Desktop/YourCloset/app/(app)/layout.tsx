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
        backgroundColor: 'var(--color-background)',
        paddingBottom: '96px',
        minHeight: '100dvh',
      }}
    >
      {children}
      <BottomNav />
    </div>
  )
}
