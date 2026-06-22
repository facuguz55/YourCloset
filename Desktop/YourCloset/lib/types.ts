// Tipos base derivados del schema (sin dependencia de Prisma)
export type Store = {
  id: string
  slug: string
  name: string
  description: string | null
  owner_id: string
  legal_name: string
  cuit: string
  phone_whatsapp: string | null
  email: string | null
  website_url: string | null
  address: string
  city: string
  lat: number
  lng: number
  hours: Record<string, string> | null
  style_tags: string[]
  gender_focus: string[]
  price_range: string
  target_age: string | null
  cover_image_url: string | null
  logo_url: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number | null
  price_range: string | null
  category: string
  style_tags: string[]
  gender: string
  sizes_available: string[]
  colors: string[]
  image_urls: string[]
  video_url: string | null
  ai_description: string | null
  ai_tags: unknown | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  style_profile: StyleProfile | null
  onboarding_done: boolean
  created_at: string
}

export type StoreRating = {
  id: string
  store_id: string
  user_id: string
  stars: number
  positive_tags: string[]
  negative_tags: string[]
  created_at: string
}

export type StoreAnalytics = {
  id: string
  store_id: string
  event_type: string
  product_id: string | null
  user_id: string | null
  created_at: string
}

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
