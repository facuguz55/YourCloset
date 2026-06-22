-- Migración 003: tablas de seguridad y rate limiting

-- Tabla rate_limits: controla requests por usuario/endpoint
CREATE TABLE IF NOT EXISTS rate_limits (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text NOT NULL,
  endpoint   text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limits_user_endpoint_idx ON rate_limits(user_id, endpoint, created_at);

-- Limpiar rate_limits viejos automáticamente (filas > 2 minutos)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS trigger AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < now() - interval '2 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rate_limits_cleanup ON rate_limits;
CREATE TRIGGER rate_limits_cleanup
  AFTER INSERT ON rate_limits
  FOR EACH STATEMENT EXECUTE FUNCTION cleanup_rate_limits();

-- Tabla admin_access_log: registrar cada acceso al panel de Founders
CREATE TABLE IF NOT EXISTS admin_access_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text REFERENCES users(id),
  path       text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_access_log_user_idx ON admin_access_log(user_id, created_at);

-- RLS: solo los admins pueden leer el log
ALTER TABLE admin_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins can read access log"
  ON admin_access_log FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- El service_role bypasses RLS automáticamente — no necesitamos política permisiva
-- Solo los admins autenticados pueden insertar (el middleware usa service_role que bypasses RLS)
CREATE POLICY "admins can insert access log"
  ON admin_access_log FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR (auth.jwt() ->> 'role') = 'admin');

-- RLS en rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can insert own rate limits"
  ON rate_limits FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "users can select own rate limits"
  ON rate_limits FOR SELECT
  USING (user_id = auth.uid()::text);
