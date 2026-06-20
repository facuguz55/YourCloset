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
      style={{ height: '100dvh', backgroundColor: '#F5F5F7' }}
    >
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto" />
        <p style={{ fontSize: '15px', color: '#6E6E73' }}>Cargando mapa...</p>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <div style={{ height: '100dvh', overflow: 'hidden' }}>
      <Suspense fallback={<MapLoading />}>
        <InteractiveMap />
      </Suspense>
    </div>
  )
}
