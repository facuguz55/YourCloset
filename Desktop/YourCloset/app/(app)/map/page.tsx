'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  { ssr: false, loading: () => <MapLoading /> }
)

function MapLoading() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}
    >
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>Cargando mapa...</p>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <div style={{ height: 'calc(100dvh - 96px)', overflow: 'hidden' }}>
      <Suspense fallback={<MapLoading />}>
        <InteractiveMap />
      </Suspense>
    </div>
  )
}
