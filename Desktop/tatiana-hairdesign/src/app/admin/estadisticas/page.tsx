import { createClient } from "@/lib/supabase/server";
import { StatsClient } from "@/components/dashboard/estadisticas/StatsClient";
import { format, subDays, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from "date-fns";

export const dynamic = "force-dynamic";

type Period = "hoy" | "semana" | "mes" | "trimestre" | "año";

function getRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const to = format(now, "yyyy-MM-dd");
  const map: Record<Period, Date> = {
    hoy: now,
    semana: startOfWeek(now, { weekStartsOn: 1 }),
    mes: startOfMonth(now),
    trimestre: startOfQuarter(now),
    año: startOfYear(now),
  };
  return { from: format(map[period], "yyyy-MM-dd"), to };
}

interface Props {
  searchParams: Promise<{ periodo?: string }>;
}

export default async function EstadisticasPage({ searchParams }: Props) {
  const { periodo } = await searchParams;
  const period: Period = (["hoy", "semana", "mes", "trimestre", "año"].includes(periodo ?? "") ? periodo : "mes") as Period;
  const { from, to } = getRange(period);

  const supabase = await createClient();

  const { data: visits } = await supabase
    .from("page_visits")
    .select("date, unique_visitors, total_visits, source")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });

  const { data: memberships } = await supabase
    .from("client_memberships")
    .select("created_at, status")
    .gte("created_at", from)
    .lte("created_at", to + "T23:59:59");

  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  const { count: activeMemberships } = await supabase
    .from("client_memberships")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <StatsClient
      period={period}
      visits={visits ?? []}
      memberships={memberships ?? []}
      totalClients={totalClients ?? 0}
      activeMemberships={activeMemberships ?? 0}
    />
  );
}
