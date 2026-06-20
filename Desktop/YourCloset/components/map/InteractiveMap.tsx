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
