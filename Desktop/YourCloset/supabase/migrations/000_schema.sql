-- ============================================================
-- YourCloset — Migración 000: Schema completo
-- Ejecutar PRIMERO en Supabase Dashboard → SQL Editor
-- ANTES de correr 001_auth_trigger.sql y 002_fts_index.sql
-- ============================================================

-- Habilitar extensión para UUIDs (ya viene habilitada en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: users
-- Extiende auth.users de Supabase. El trigger 001 la popula.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id              TEXT PRIMARY KEY,                         -- UUID de auth.uid()
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  avatar_url      TEXT,
  style_profile   JSONB,                                    -- { estilos[], genero, precio_rango, talle }
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: stores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  owner_id        TEXT NOT NULL REFERENCES public.users(id),

  -- Datos legales
  legal_name      TEXT NOT NULL,
  cuit            TEXT NOT NULL,

  -- Contacto
  phone_whatsapp  TEXT,
  email           TEXT,
  website_url     TEXT,

  -- Ubicación
  address         TEXT NOT NULL,
  city            TEXT NOT NULL DEFAULT 'Santa Fe',
  lat             FLOAT8 NOT NULL,
  lng             FLOAT8 NOT NULL,

  -- Horarios (JSON flexible)
  hours           JSONB,

  -- Identidad de estilo
  style_tags      TEXT[] NOT NULL DEFAULT '{}',
  gender_focus    TEXT[] NOT NULL DEFAULT '{}',
  price_range     TEXT NOT NULL,
  target_age      TEXT,

  -- Media
  cover_image_url TEXT,
  logo_url        TEXT,

  -- Estado
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_verified     BOOLEAN NOT NULL DEFAULT false,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id        TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

  name            TEXT NOT NULL,
  description     TEXT,
  price           FLOAT8,
  price_range     TEXT,

  -- Clasificación
  category        TEXT NOT NULL,                            -- campera | remera | pantalon | vestido | calzado | accesorio
  style_tags      TEXT[] NOT NULL DEFAULT '{}',
  gender          TEXT NOT NULL,                            -- masculino | femenino | unisex
  sizes_available TEXT[] NOT NULL DEFAULT '{}',
  colors          TEXT[] NOT NULL DEFAULT '{}',

  -- Media
  image_urls      TEXT[] NOT NULL DEFAULT '{}',
  video_url       TEXT,

  -- Metadata IA (Fase 2)
  ai_description  TEXT,
  ai_tags         JSONB,

  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: style_tags
-- ============================================================
CREATE TABLE IF NOT EXISTS public.style_tags (
  id    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name  TEXT UNIQUE NOT NULL,
  emoji TEXT,
  type  TEXT NOT NULL                                       -- estilo | genero | precio | edad
);

-- ============================================================
-- TABLA: store_ratings
-- Una valoración por usuario por local (constraint unique)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.store_ratings (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id      TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES public.users(id),
  stars         INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  positive_tags TEXT[] NOT NULL DEFAULT '{}',
  negative_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- ============================================================
-- TABLA: outfits (Fase 2 — se usa la tabla ahora, pero solo
-- se puebla con IA en Fase 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.outfits (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES public.users(id),
  name       TEXT,
  items      JSONB NOT NULL,                                -- [{ product_id, store_id, role }]
  occasion   TEXT NOT NULL,                                 -- casual | sport | formal | noche
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: saved_products (wishlist)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_products (
  user_id    TEXT NOT NULL REFERENCES public.users(id),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- ============================================================
-- TABLA: saved_outfits
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_outfits (
  user_id    TEXT NOT NULL REFERENCES public.users(id),
  outfit_id  TEXT NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, outfit_id)
);

-- ============================================================
-- TABLA: saved_stores (favoritos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_stores (
  user_id    TEXT NOT NULL REFERENCES public.users(id),
  store_id   TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, store_id)
);

-- ============================================================
-- TABLA: store_analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.store_analytics (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id   TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,                                 -- profile_view | whatsapp_click | email_click | website_click | product_view
  product_id TEXT,
  user_id    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: search_history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.search_history (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES public.users(id),
  query      TEXT,
  query_type TEXT NOT NULL,                                 -- text | image | voice
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Trigger updated_at para stores y products
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stores_updated_at ON public.stores;
CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS: Habilitar Row Level Security en todas las tablas
-- (Las policies se definen en migraciones separadas o en el
-- Supabase Dashboard. Por ahora se habilita sin policies
-- para que el desarrollo funcione con la service role key.)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Policy temporal permisiva para desarrollo (reemplazar en producción)
CREATE POLICY "service_role_full_access" ON public.users    USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.stores   USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.products USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.style_tags      USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.store_ratings   USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.outfits         USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.saved_products  USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.saved_outfits   USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.saved_stores    USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.store_analytics USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public.search_history  USING (true) WITH CHECK (true);
