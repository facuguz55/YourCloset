'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import StoreBottomSheet from './StoreBottomSheet'
import type { StoreWithRating } from '@/lib/types'

const SANTA_FE: [number, number] = [-31.6333, -60.7]

function FlyToUser() {
  const map = useMap()
  useEffect(() => {
    let cancelled = false
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        if (!cancelled) map.flyTo([coords.latitude, coords.longitude], 15, { animate: true })
      },
      () => {}
    )
    return () => { cancelled = true }
  }, [map])
  return null
}

function ZoomControls() {
  const map = useMap()
  const btnStyle: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 12,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid rgba(0,0,0,0.08)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 300, color: '#1D1D1F', cursor: 'pointer',
    userSelect: 'none',
  }
  return (
    <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button style={btnStyle} onClick={() => map.zoomIn()}>+</button>
      <button style={btnStyle} onClick={() => map.zoomOut()}>−</button>
    </div>
  )
}

function LocateButton() {
  const map = useMap()
  const [loading, setLoading] = useState(false)
  function locate() {
    setLoading(true)
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        map.flyTo([coords.latitude, coords.longitude], 16, { animate: true })
        setLoading(false)
      },
      () => setLoading(false)
    )
  }
  return (
    <button
      onClick={locate}
      style={{
        position: 'absolute', right: 12, bottom: 16, zIndex: 1000,
        width: 44, height: 44, borderRadius: 14,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}
    >
      {loading ? (
        <div style={{ width: 18, height: 18, border: '2px solid #0071E3', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </svg>
      )}
    </button>
  )
}

export default function InteractiveMap() {
  const [stores, setStores] = useState<StoreWithRating[]>([])
  const [selectedStore, setSelectedStore] = useState<StoreWithRating | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const defaultIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#0071E3;border:2.5px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,113,227,0.45);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

  useEffect(() => {
    fetch('/api/stores?limit=100')
      .then((r) => r.json())
      .then(({ data }) => setStores(data ?? []))
      .catch(() => {})
  }, [])

  function handleMarkerClick(store: StoreWithRating) {
    setSelectedStore(store)
    if (mapRef.current) {
      mapRef.current.flyTo([store.lat, store.lng], 16, { animate: true })
    }
  }

  function handleTrack(eventType: string) {
    if (!selectedStore) return
    fetch(`/api/stores/${selectedStore.slug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType }),
    }).catch(() => {})
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={SANTA_FE}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
        />
        <FlyToUser />
        <ZoomControls />
        <LocateButton />
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={defaultIcon}
            eventHandlers={{ click: () => handleMarkerClick(store) }}
          >
            <Popup>{store.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      <StoreBottomSheet
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        onTrack={handleTrack}
      />
    </div>
  )
}
