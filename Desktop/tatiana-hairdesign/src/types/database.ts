export type Branch = "larioja" | "miraflores" | "moreno";
export type UserRole = "admin" | "staff";
export type MembershipStatus = "active" | "expired" | "cancelled";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  branch: Branch | null;
  created_at: string;
}

export interface MembershipType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  benefits: { items: string[] } | null;
  active: boolean;
  created_at: string;
}

export interface ClientMembership {
  id: string;
  client_id: string;
  membership_type_id: string;
  start_date: string;
  end_date: string;
  status: MembershipStatus;
  paid: boolean;
  notes: string | null;
  created_at: string;
  // relations
  client?: Client;
  membership_type?: MembershipType;
}

export interface Coupon {
  id: string;
  code: string;
  discount_pct: number;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string | null;
  client_name: string | null;
  service: string;
  branch: Branch;
  appointment_date: string;
  status: AppointmentStatus;
  notes: string | null;
  price: number | null;
  created_at: string;
  // relations
  client?: Client;
}

export interface PageVisit {
  id: string;
  date: string;
  unique_visitors: number;
  total_visits: number;
  source: string | null;
  created_at: string;
}

export interface SiteConfig {
  key: string;
  value: string | null;
  updated_at: string;
}

export type SiteConfigKey =
  | "maintenance_mode"
  | "maintenance_message"
  | "hero_title"
  | "hero_subtitle"
  | "about_text"
  | "instagram_url"
  | "whatsapp_larioja"
  | "whatsapp_miraflores"
  | "whatsapp_moreno"
  | "branch_larioja_address"
  | "branch_miraflores_address"
  | "branch_moreno_address";

export type SiteConfigMap = Partial<Record<SiteConfigKey, string>>;
