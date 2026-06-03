-- Right Botines Video Editor — Schema Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Tabla principal de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  format          text,             -- '16:9' | '9:16' | '1:1' | '4:5' | 'custom'
  width           int,
  height          int,
  status          text NOT NULL DEFAULT 'pending',  -- 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress        int NOT NULL DEFAULT 0,           -- 0-100
  step            text,             -- mensaje del paso actual para UI
  original_url    text,             -- URL Supabase Storage video original
  processed_url   text,             -- URL Supabase Storage video procesado
  thumbnail_url   text,
  duration        float,            -- duración en segundos
  options         jsonb,            -- { removeSilence, subtitles, logo, subtitleConfig, logoConfig }
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Habilitar Realtime para esta tabla (requerido para el tracking de progreso)
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Storage buckets (ejecutar separado si es necesario)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos-original', 'videos-original', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos-processed', 'videos-processed', true);

-- RLS: Sin auth, acceso público total (herramienta interna)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all" ON projects FOR ALL USING (true) WITH CHECK (true);
