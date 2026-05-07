-- ============================================
-- TATIANA MARTINEZ HAIR DESIGN
-- Parte 2: Datos iniciales + Seguridad
-- ============================================

-- ── Datos iniciales: las 4 membresías ────────────────────

INSERT INTO membership_types (name, description, price, benefits) VALUES
(
  'Membresía 1',
  'Hidratación y brushing mensual',
  105000,
  '{"items": ["1 tratamiento hidratante al mes", "4 brushing al mes"]}'
),
(
  'Membresía 2',
  'Hidratación, brushing y spa de cabello',
  162500,
  '{"items": ["1 tratamiento hidratante al mes", "4 brushing al mes", "1 spa de cabello"]}'
),
(
  'Membresía 3',
  'Pack completo de nutrición y tratamiento',
  207500,
  '{"items": ["2 tratamientos hidratantes al mes", "4 brushing al mes", "1 spa de cabello", "1 Wella Ozono"]}'
),
(
  'Membresía 4',
  'Cortes de caballero al mes',
  45000,
  '{"items": ["2 cortes de caballero al mes"]}'
);

-- ── Datos iniciales: configuración del sitio ─────────────

INSERT INTO site_config (key, value) VALUES
('maintenance_mode', 'false'),
('maintenance_message', 'Estamos trabajando para vos. Volvemos pronto ✨'),
('hero_title', 'Tatiana Martinez Hair Design'),
('hero_subtitle', 'Unimos belleza, formación y crecimiento.'),
('about_text', 'Con más de 20 años de experiencia, Tatiana Martinez es estilista y colorista internacional reconocida en Santa Fe, Argentina.'),
('instagram_url', 'https://www.instagram.com/tatianamartinezestilista.ok'),
('whatsapp_larioja', '5493424368868'),
('whatsapp_miraflores', '5493424216359'),
('whatsapp_moreno', '5493424443516'),
('branch_larioja_address', 'La Rioja 2718, Centro'),
('branch_miraflores_address', 'Complejo Miraflores, Zona Country'),
('branch_moreno_address', 'Moreno 2599');

-- ── Datos iniciales: 2 cupones de ejemplo ────────────────

INSERT INTO coupons (code, discount_pct, valid_until, max_uses, active) VALUES
('BIENVENIDA15', 15, '2025-12-31', 50, true),
('PROMO10', 10, NULL, NULL, true);

-- ── Seguridad: Row Level Security ────────────────────────
-- Solo usuarios autenticados (el equipo de Tatiana) pueden
-- ver y modificar datos del dashboard.
-- La página pública solo puede LEER membership_types y site_config.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden hacer todo
CREATE POLICY "Authenticated full access" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON client_memberships
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON coupons
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON page_visits
  FOR ALL USING (auth.role() = 'authenticated');

-- membership_types: cualquiera puede LEER (para mostrar en la página pública)
CREATE POLICY "Public read" ON membership_types
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write" ON membership_types
  FOR ALL USING (auth.role() = 'authenticated');

-- site_config: cualquiera puede LEER (para textos y modo mantenimiento)
CREATE POLICY "Public read" ON site_config
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write" ON site_config
  FOR ALL USING (auth.role() = 'authenticated');
