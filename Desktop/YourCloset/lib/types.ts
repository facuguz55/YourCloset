import type { Store, Product, User, StoreRating, StoreAnalytics } from '@prisma/client'

export type { Store, Product, User, StoreRating, StoreAnalytics }

export type StyleProfile = {
  estilos: string[]
  genero: 'masculino' | 'femenino' | 'unisex' | 'sin_preferencia'
  precio_rango: 'economico' | 'medio' | 'premium'
  talle?: string
}

export type UserRole = 'user' | 'store_owner' | 'admin'

export type StoreWithRating = Store & {
  _avg_rating?: number
  _rating_count?: number
}

export type ProductWithStore = Product & {
  store: Pick<Store, 'id' | 'slug' | 'name' | 'lat' | 'lng' | 'price_range'>
}

export type SearchFilters = {
  query?: string
  category?: string
  style?: string
  gender?: string
  price_range?: string
  rating_min?: number
  order_by?: 'relevance' | 'price_asc' | 'price_desc' | 'rating'
  cursor?: string
  limit?: number
}

export type MapFilters = {
  style?: string
  price_range?: string
  rating_min?: number
}

export type AnalyticsEventType =
  | 'profile_view'
  | 'whatsapp_click'
  | 'email_click'
  | 'website_click'
  | 'product_view'

export type ApiSuccess<T> = { data: T; meta?: Record<string, unknown> }
export type ApiError = { error: string; code: string }
