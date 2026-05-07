-- ═══════════════════════════════════════════════════════════════
-- Tatiana Martinez Hair Design — Schema inicial
-- ═══════════════════════════════════════════════════════════════

-- ── Extensiones ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tipos enumerados ──────────────────────────────────────────
do $$ begin
  create type branch_type as enum ('larioja', 'miraflores', 'moreno');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('admin', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type membership_status as enum ('active', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ── Profiles (usuarios del dashboard) ────────────────────────
create table if not exists profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  name      text,
  role      user_role not null default 'staff',
  created_at timestamptz not null default now()
);

-- ── Clients (clientes del salón) ──────────────────────────────
create table if not exists clients (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  phone      text,
  email      text,
  notes      text,
  branch     branch_type,
  created_at timestamptz not null default now()
);

-- ── Membership types ──────────────────────────────────────────
create table if not exists membership_types (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  price       numeric(12,2) not null default 0,
  benefits    jsonb,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Client memberships ────────────────────────────────────────
create table if not exists client_memberships (
  id                 uuid primary key default uuid_generate_v4(),
  client_id          uuid not null references clients(id) on delete cascade,
  membership_type_id uuid not null references membership_types(id),
  start_date         date not null,
  end_date           date not null,
  status             membership_status not null default 'active',
  paid               boolean not null default false,
  notes              text,
  created_at         timestamptz not null default now()
);

-- ── Coupons ───────────────────────────────────────────────────
create table if not exists coupons (
  id            uuid primary key default uuid_generate_v4(),
  code          text not null unique,
  discount_pct  smallint not null check (discount_pct between 1 and 100),
  valid_until   date,
  max_uses      integer,
  current_uses  integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── Appointments ──────────────────────────────────────────────
create table if not exists appointments (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid references clients(id) on delete set null,
  client_name      text,
  service          text not null,
  branch           branch_type not null,
  appointment_date timestamptz not null,
  status           appointment_status not null default 'pending',
  notes            text,
  price            numeric(12,2),
  created_at       timestamptz not null default now()
);

-- ── Page visits ───────────────────────────────────────────────
create table if not exists page_visits (
  id               uuid primary key default uuid_generate_v4(),
  date             date not null,
  unique_visitors  integer not null default 0,
  total_visits     integer not null default 0,
  source           text,
  created_at       timestamptz not null default now(),
  unique (date, source)
);

-- ── Site config ───────────────────────────────────────────────
create table if not exists site_config (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════

alter table profiles          enable row level security;
alter table clients           enable row level security;
alter table membership_types  enable row level security;
alter table client_memberships enable row level security;
alter table coupons           enable row level security;
alter table appointments      enable row level security;
alter table page_visits       enable row level security;
alter table site_config       enable row level security;

-- Public read para membership_types y site_config (página pública)
create policy "public_read_membership_types"
  on membership_types for select using (true);

create policy "public_read_site_config"
  on site_config for select using (true);

-- Authenticated full access (dashboard)
create policy "auth_all_profiles"
  on profiles for all using (auth.role() = 'authenticated');

create policy "auth_all_clients"
  on clients for all using (auth.role() = 'authenticated');

create policy "auth_all_membership_types"
  on membership_types for all using (auth.role() = 'authenticated');

create policy "auth_all_client_memberships"
  on client_memberships for all using (auth.role() = 'authenticated');

create policy "auth_all_coupons"
  on coupons for all using (auth.role() = 'authenticated');

create policy "auth_all_appointments"
  on appointments for all using (auth.role() = 'authenticated');

create policy "auth_all_page_visits"
  on page_visits for all using (auth.role() = 'authenticated');

create policy "auth_all_site_config"
  on site_config for all using (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════
-- Función: auto-create profile al registrar usuario
-- ════════════════════════════════════════════════════════════════
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
