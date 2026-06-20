'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('yc-theme')
    setDark(stored === 'dark')
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
          ? 'linear-gradient(160deg, #0a0a0f 0%, #0d1117 40%, #0f0a1a 100%)'
          : 'linear-gradient(160deg, #dde8ff 0%, #f0ebff 45%, #fce8f5 100%)',
        paddingBottom: '96px',
        minHeight: '100dvh',
      }}
    >
      {children}
      <BottomNav />
    </div>
  )
}
