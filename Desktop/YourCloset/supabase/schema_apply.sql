-- ============================================================
-- YourCloset — Schema completo para aplicar en Supabase SQL Editor
-- Ejecutá todo este bloque de una sola vez
-- ============================================================

-- 1. TABLAS
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "style_profile" JSONB,
    "onboarding_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "stores" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "phone_whatsapp" TEXT,
    "email" TEXT,
    "website_url" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Santa Fe',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "hours" JSONB,
    "style_tags" TEXT[],
    "gender_focus" TEXT[],
    "price_range" TEXT NOT NULL,
    "target_age" TEXT,
    "cover_image_url" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "price_range" TEXT,
    "category" TEXT NOT NULL,
    "style_tags" TEXT[],
    "gender" TEXT NOT NULL,
    "sizes_available" TEXT[],
    "colors" TEXT[],
    "image_urls" TEXT[],
    "video_url" TEXT,
    "ai_description" TEXT,
    "ai_tags" JSONB,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "style_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "style_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "store_ratings" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "positive_tags" TEXT[],
    "negative_tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "store_ratings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "outfits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "items" JSONB NOT NULL,
    "occasion" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "outfits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "saved_products" (
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_products_pkey" PRIMARY KEY ("user_id","product_id")
);

CREATE TABLE IF NOT EXISTS "saved_outfits" (
    "user_id" TEXT NOT NULL,
    "outfit_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_outfits_pkey" PRIMARY KEY ("user_id","outfit_id")
);

CREATE TABLE IF NOT EXISTS "saved_stores" (
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_stores_pkey" PRIMARY KEY ("user_id","store_id")
);

CREATE TABLE IF NOT EXISTS "store_analytics" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "product_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "store_analytics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "search_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT,
    "query_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- 2. INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "stores_slug_key" ON "stores"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "style_tags_name_key" ON "style_tags"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "store_ratings_store_id_user_id_key" ON "store_ratings"("store_id", "user_id");

-- 3. FOREIGN KEYS
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_fkey"
    FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT "products_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "store_ratings" ADD CONSTRAINT "store_ratings_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "store_ratings" ADD CONSTRAINT "store_ratings_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "outfits" ADD CONSTRAINT "outfits_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "saved_products" ADD CONSTRAINT "saved_products_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "saved_products" ADD CONSTRAINT "saved_products_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "saved_outfits" ADD CONSTRAINT "saved_outfits_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "saved_outfits" ADD CONSTRAINT "saved_outfits_outfit_id_fkey"
    FOREIGN KEY ("outfit_id") REFERENCES "outfits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "saved_stores" ADD CONSTRAINT "saved_stores_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "saved_stores" ADD CONSTRAINT "saved_stores_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "store_analytics" ADD CONSTRAINT "store_analytics_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. TRIGGER: crea el perfil en "users" automáticamente cuando alguien se registra en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, onboarding_done)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RLS — desactivado por ahora para que la app funcione (activalo cuando tengas la lógica lista)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE outfits DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_outfits DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- FIN — si todo corre sin errores, la app ya puede guardar datos
-- ============================================================
