-- ============================================
-- TATIANA MARTINEZ HAIR DESIGN
-- Parte 1: Tablas base
-- ============================================

-- Perfiles de usuarios del dashboard (Tatiana y su equipo)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes del salón
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  branch TEXT CHECK (branch IN ('larioja', 'miraflores', 'moreno')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de membresía (las 4 que tiene Tatiana)
CREATE TABLE membership_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  benefits JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membresías activas de cada cliente
CREATE TABLE client_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  membership_type_id UUID REFERENCES membership_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cupones de descuento
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_pct INTEGER NOT NULL CHECK (discount_pct > 0 AND discount_pct <= 100),
  valid_until DATE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turnos / reservas
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT,
  service TEXT NOT NULL,
  branch TEXT NOT NULL CHECK (branch IN ('larioja', 'miraflores', 'moreno')),
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  price INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitas a la página (analytics básico)
CREATE TABLE page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  unique_visitors INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración del sitio (textos editables, modo mantenimiento, etc.)
CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
