import { createClient } from "@/lib/supabase/server";
import { PeriodTabs } from "@/components/dashboard/inicio/PeriodTabs";
import { StatCards } from "@/components/dashboard/inicio/StatCards";
import { RecentMemberships } from "@/components/dashboard/inicio/RecentMemberships";
import { RecentCoupons } from "@/components/dashboard/inicio/RecentCoupons";
import { SiteStatusCard } from "@/components/dashboard/inicio/SiteStatusCard";
import { format, subDays, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

type Period = "hoy" | "ayer" | "semana";

function getPeriodRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");

  if (period === "hoy") {
    return { from: today, to: today };
  }
  if (period === "ayer") {
    const y = format(subDays(now, 1), "yyyy-MM-dd");
    return { from: y, to: y };
  }
  // semana
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  return { from: weekStart, to: today };
}

interface Props {
  searchParams: Promise<{ periodo?: string }>;
}

export default async function InicioPage({ searchParams }: Props) {
  const { periodo } = await searchParams;
  const period: Period =
    periodo === "ayer" ? "ayer" : periodo === "semana" ? "semana" : "hoy";

  const { from, to } = getPeriodRange(period);
  const supabase = await createClient();

  // ── Métricas ──────────────────────────────────────────────────────────────
  const [
    { count: activeMemberships },
    { count: expiringMemberships },
    { count: totalClients },
    { count: activeCoupons },
    { data: recentMemberships },
    { data: recentCoupons },
    { data: configRows },
  ] = await Promise.all([
    supabase
      .from("client_memberships")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("client_memberships")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lte("end_date", format(subDays(new Date(), -7), "yyyy-MM-dd"))
      .gte("end_date", format(new Date(), "yyyy-MM-dd")),

    supabase
      .from("clients")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("active", true),

    supabase
      .from("client_memberships")
      .select(`
        id, start_date, end_date, status, paid,
        client:clients(name, phone),
        membership_type:membership_types(name, price)
      `)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("coupons")
      .select("id, code, discount_pct, valid_until, current_uses, active")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("site_config")
      .select("key, value")
      .in("key", ["maintenance_mode", "maintenance_message"]),
  ]);

  const maintenance =
    configRows?.find((r) => r.key === "maintenance_mode")?.value === "true";
  const maintenanceMsg =
    configRows?.find((r) => r.key === "maintenance_message")?.value ?? "";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  const dateLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {greeting} 👋
        </h1>
        <p className="mt-1 text-sm text-muted capitalize">{dateLabel}</p>
      </div>

      {/* Tabs de período */}
      <PeriodTabs current={period} />

      {/* Stat cards */}
      <StatCards
        activeMemberships={activeMemberships ?? 0}
        expiringMemberships={expiringMemberships ?? 0}
        totalClients={totalClients ?? 0}
        activeCoupons={activeCoupons ?? 0}
      />

      {/* Dos columnas */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentMemberships memberships={recentMemberships ?? []} />
        <RecentCoupons coupons={recentCoupons ?? []} />
      </div>

      {/* Estado del sitio */}
      <SiteStatusCard
        maintenance={maintenance}
        maintenanceMsg={maintenanceMsg}
      />
    </div>
  );
}
