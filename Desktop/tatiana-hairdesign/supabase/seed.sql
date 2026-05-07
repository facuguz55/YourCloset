-- ═══════════════════════════════════════════════════════════════
-- Tatiana Martinez Hair Design — Seed data
-- ═══════════════════════════════════════════════════════════════

-- Membresías (precios en ARS)
insert into membership_types (id, name, description, price, benefits, active) values
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Membresía Esencial',
  '1 tratamiento hidratante + 4 brushing por mes',
  105000,
  '{"items": ["1 tratamiento hidratante", "4 brushing por mes", "Productos premium Wella"]}',
  true
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'Membresía Completa',
  '1 tratamiento hidratante + 4 brushing + 1 spa de cabello',
  162500,
  '{"items": ["1 tratamiento hidratante", "4 brushing por mes", "1 spa de cabello", "Productos premium Wella"]}',
  true
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  'Membresía Premium',
  '2 tratamientos hidratantes + 4 brushing + 1 spa + 1 Wella Ozono',
  207500,
  '{"items": ["2 tratamientos hidratantes", "4 brushing por mes", "1 spa de cabello", "1 Wella Ozono", "Productos premium Wella"]}',
  true
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  'Membresía Caballero',
  '2 cortes de caballero por mes',
  45000,
  '{"items": ["2 cortes de caballero por mes"]}',
  true
)
on conflict (id) do nothing;

-- Cupones de ejemplo
insert into coupons (code, discount_pct, valid_until, max_uses, current_uses, active) values
('BIENVENIDA', 15, (current_date + interval '90 days')::date, 50, 0, true),
('MEMBRESIA10', 10, null, null, 3, true)
on conflict (code) do nothing;

-- Configuración inicial del sitio
insert into site_config (key, value) values
('maintenance_mode', 'false'),
('maintenance_message', 'Estamos mejorando el sitio para vos. Volvemos pronto.'),
('hero_title', 'Tatiana Martinez Hair Design'),
('hero_subtitle', 'Unimos belleza, formación y crecimiento.'),
('about_text', 'Más de 20 años de experiencia en estilismo y colorimetría internacional. Un equipo comprometido con la excelencia y el cuidado de tu cabello.'),
('instagram_url', 'https://www.instagram.com/tatianamartinezestilista.ok'),
('whatsapp_larioja', '5493424368868'),
('whatsapp_miraflores', '5493424216359'),
('whatsapp_moreno', '5493424443516'),
('branch_larioja_address', 'La Rioja 2718 | Centro'),
('branch_miraflores_address', 'Complejo Miraflores'),
('branch_moreno_address', 'Moreno 2599')
on conflict (key) do update set value = excluded.value;

-- Visitas de ejemplo para gráficos
insert into page_visits (date, unique_visitors, total_visits, source)
select
  (current_date - (n || ' days')::interval)::date,
  floor(random() * 80 + 20)::integer,
  floor(random() * 150 + 40)::integer,
  (array['instagram', 'directo', 'google', 'whatsapp'])[floor(random() * 4 + 1)]
from generate_series(0, 29) as n
on conflict (date, source) do nothing;
