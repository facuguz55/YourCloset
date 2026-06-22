'use client'

import { useEffect } from 'react'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem('yc-theme')
    const isDark = stored === 'dark'
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
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
