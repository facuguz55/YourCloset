-- ============================================================
-- YourCloset — Migración 002: Índice Full-Text Search (FTS)
-- Usa trigger en vez de columna generada (más compatible con Supabase)
-- ============================================================

-- Columna fts como columna normal (el trigger la mantiene actualizada)
ALTER TABLE products ADD COLUMN IF NOT EXISTS fts tsvector;

-- Función que recalcula fts en cada insert/update
CREATE OR REPLACE FUNCTION products_fts_update()
RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector(
    'spanish'::regconfig,
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.style_tags, ' '), '') || ' ' ||
    coalesce(NEW.category, '') || ' ' ||
    coalesce(NEW.gender, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_fts_trigger ON products;
CREATE TRIGGER products_fts_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_fts_update();

-- Índice GIN para búsquedas rápidas
CREATE INDEX IF NOT EXISTS products_fts_idx ON products USING GIN(fts);

-- ============================================================
-- Uso en API Route /api/search/text:
--
-- SELECT p.*, s.name AS store_name, s.slug AS store_slug
-- FROM products p
-- JOIN stores s ON p.store_id = s.id
-- WHERE p.fts @@ plainto_tsquery('spanish'::regconfig, 'campera negra')
--   AND p.is_active = true AND s.is_active = true
-- ORDER BY ts_rank(p.fts, plainto_tsquery('spanish'::regconfig, 'campera negra')) DESC;
-- ============================================================
