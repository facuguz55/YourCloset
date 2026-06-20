-- ============================================================
-- YourCloset — Migración 002: Índice Full-Text Search (FTS)
-- Búsqueda full-text sobre productos usando to_tsvector nativo
-- de PostgreSQL en español. Sin dependencia de OpenAI en MVP.
-- ============================================================

-- Columna generada con vector de búsqueda en español
-- Concatena: nombre + descripción + style_tags del producto
ALTER TABLE products ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector(
      'spanish'::regconfig,
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(array_to_string(style_tags, ' '), '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(gender, '')
    )
  ) STORED;

-- Índice GIN para búsquedas rápidas
CREATE INDEX IF NOT EXISTS products_fts_idx ON products USING GIN(fts);

-- ============================================================
-- Uso en API Route /api/search/text:
--
-- SELECT p.*, s.name AS store_name, s.slug AS store_slug,
--        s.lat, s.lng, s.price_range AS store_price_range
-- FROM products p
-- JOIN stores s ON p.store_id = s.id
-- WHERE p.fts @@ plainto_tsquery('spanish', 'campera negra')
--   AND p.is_active = true
--   AND s.is_active = true
-- ORDER BY ts_rank(p.fts, plainto_tsquery('spanish', 'campera negra')) DESC;
-- ============================================================
