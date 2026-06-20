'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import StoreBottomSheet from './StoreBottomSheet'
import type { StoreWithRating } from '@/lib/types'

const SANTA_FE: [number, number] = [-31.6333, -60.7]

function UserLocationDot({ position }: { position: [number, number] }) {
  const dotIcon = L.divIcon({
    className: '',
    html: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(0,113,227,0.25);animation:pulse-ring 2s ease-out infinite;"></div>
      <div style="width:12px;height:12px;border-radius:50%;background:#0071E3;border:2.5px solid #FFFFFF;box-shadow:0 0 0 1px rgba(0,113,227,0.3),0 2px 6px rgba(0,113,227,0.5);position:relative;z-index:1;"></div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
  return <Marker position={position} icon={dotIcon} />
}

function LocationTracker({ onLocation }: { onLocation: (pos: [number, number]) => void }) {
  const map = useMap()
  useEffect(() => {
    let cancelled = false
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        if (cancelled) return
        const pos: [number, number] = [coords.latitude, coords.longitude]
        onLocation(pos)
        map.flyTo(pos, 15, { animate: true })
      },
      () => {}
    )
    return () => { cancelled = true }
  }, [map, onLocation])
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

function LocateButton({ onLocate }: { onLocate: () => void }) {
  const map = useMap()
  const [loading, setLoading] = useState(false)
  function locate() {
    setLoading(true)
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude]
        map.flyTo(pos, 16, { animate: true })
        onLocate()
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      )}
    </button>
  )
}

export default function InteractiveMap() {
  const [stores, setStores] = useState<StoreWithRating[]>([])
  const [selectedStore, setSelectedStore] = useState<StoreWithRating | null>(null)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const storeIcon = L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:#0071E3;border:2px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,113,227,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })

  useEffect(() => {
    fetch('/api/stores?limit=100')
      .then((r) => r.json())
      .then(({ data }) => setStores(data ?? []))
      .catch(() => {})
  }, [])

  function handleMarkerClick(store: StoreWithRating) {
    setSelectedStore(store)
    if (mapRef.current) mapRef.current.flyTo([store.lat, store.lng], 16, { animate: true })
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
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
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
            attribution='© OpenStreetMap contributors © CARTO'
          />
          <LocationTracker onLocation={setUserPos} />
          <ZoomControls />
          <LocateButton onLocate={() => {}} />
          {userPos && <UserLocationDot position={userPos} />}
          {stores.map((store) => (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              icon={storeIcon}
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
    </>
  )
}
