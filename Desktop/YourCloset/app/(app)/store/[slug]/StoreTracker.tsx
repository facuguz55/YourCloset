'use client'

import { useEffect } from 'react'

export default function StoreTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/stores/${slug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'profile_view' }),
    }).catch(() => {})
  }, [slug])

  return null
}
