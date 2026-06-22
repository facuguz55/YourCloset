-- Migración 004: campos nuevos en stores y products, tablas nuevas

-- stores: campos nuevos
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS instagram_url   text,
  ADD COLUMN IF NOT EXISTS is_paused       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_promoted     boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS promoted_from   timestamptz,
  ADD COLUMN IF NOT EXISTS promoted_until  timestamptz,
  ADD COLUMN IF NOT EXISTS special_hours   jsonb;

-- products: campos nuevos
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS discount_percent float,
  ADD COLUMN IF NOT EXISTS is_out_of_stock  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_promoted      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS colors           text[];

-- saved_products: tabla wishlist
CREATE TABLE IF NOT EXISTS saved_products (
  user_id    text REFERENCES users(id) ON DELETE CASCADE,
  product_id text REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own saved products"
  ON saved_products FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- saved_stores: locales favoritos
CREATE TABLE IF NOT EXISTS saved_stores (
  user_id    text REFERENCES users(id) ON DELETE CASCADE,
  store_id   text REFERENCES stores(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, store_id)
);

ALTER TABLE saved_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own saved stores"
  ON saved_stores FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- restock_alerts: alertas de reposición de stock
CREATE TABLE IF NOT EXISTS restock_alerts (
  user_id    text REFERENCES users(id) ON DELETE CASCADE,
  product_id text REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

ALTER TABLE restock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can manage own restock alerts"
  ON restock_alerts FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- reports: sistema de reportes
CREATE TABLE IF NOT EXISTS reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id text REFERENCES users(id),
  type        text NOT NULL CHECK (type IN ('fake_product', 'inappropriate_store', 'incorrect_info')),
  store_id    text REFERENCES stores(id),
  product_id  text REFERENCES products(id),
  status      text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  notes       text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can create reports"
  ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid()::text);
CREATE POLICY "admins can manage reports"
  ON reports FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- store_audit_log: historial de cambios
CREATE TABLE IF NOT EXISTS store_audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   text REFERENCES stores(id),
  changed_by text REFERENCES users(id),
  field      text NOT NULL,
  old_value  text,
  new_value  text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE store_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "store owners can read own audit log"
  ON store_audit_log FOR SELECT
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()::text)
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- algorithm_config: pesos del algoritmo de recomendación
CREATE TABLE IF NOT EXISTS algorithm_config (
  id                  text PRIMARY KEY DEFAULT 'singleton',
  weight_onboarding   float DEFAULT 0.40,
  weight_saved        float DEFAULT 0.25,
  weight_views        float DEFAULT 0.20,
  weight_swipes       float DEFAULT 0.15,
  updated_at          timestamptz DEFAULT now(),
  updated_by          text
);

INSERT INTO algorithm_config(id) VALUES('singleton') ON CONFLICT DO NOTHING;

ALTER TABLE algorithm_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read algorithm config"
  ON algorithm_config FOR SELECT USING (true);
CREATE POLICY "only admins can update algorithm config"
  ON algorithm_config FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- trending_cache: cache de tendencias calculado diariamente
CREATE TABLE IF NOT EXISTS trending_cache (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text NOT NULL CHECK (type IN ('style_tag', 'product', 'store')),
  value         text NOT NULL,
  score         int DEFAULT 0,
  calculated_at timestamptz DEFAULT now()
);

ALTER TABLE trending_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read trending cache"
  ON trending_cache FOR SELECT USING (true);
