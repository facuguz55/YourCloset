"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cancelMembership } from "@/app/actions/memberships";
import { cn } from "@/lib/utils";
import { Search, XCircle } from "lucide-react";

interface Row {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  paid: boolean;
  notes: string | null;
  created_at: string;
  client: { id: string; name: string; phone: string | null }[] | null;
  membership_type: { id: string; name: string; price: number }[] | null;
}

interface Props {
  memberships: Row[];
}

const statusMap: Record<string, { label: string; cls: string }> = {
  active:    { label: "Activa",    cls: "bg-emerald-500/15 text-emerald-400" },
  expired:   { label: "Vencida",   cls: "bg-red-500/15 text-red-400" },
  cancelled: { label: "Cancelada", cls: "bg-dark-alt text-muted" },
};

function fmt(d: string) {
  return format(new Date(d + "T00:00:00"), "d MMM yy", { locale: es });
}

function isExpiringSoon(endDate: string) {
  const diff = new Date(endDate + "T00:00:00").getTime() - Date.now();
  return diff > 0 && diff < 7 * 86400 * 1000;
}

export function MembershipTable({ memberships }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "cancelled">("all");

  const filtered = memberships.filter((m) => {
    const name = m.client?.[0]?.name?.toLowerCase() ?? "";
    const type = m.membership_type?.[0]?.name?.toLowerCase() ?? "";
    const q = search.toLowerCase();
    const matchSearch = name.includes(q) || type.includes(q);
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="rounded-xl bg-dark-card border border-dark-border flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente o membresía…"
            className="w-full bg-dark-alt border border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "expired", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f ? "bg-gold text-dark" : "bg-dark-alt text-muted hover:text-foreground"
              )}
            >
              {f === "all" ? "Todos" : statusMap[f].label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-2 px-2 text-xs text-muted font-medium">Cliente</th>
              <th className="text-left py-2 px-2 text-xs text-muted font-medium hidden sm:table-cell">Plan</th>
              <th className="text-left py-2 px-2 text-xs text-muted font-medium">Vence</th>
              <th className="text-left py-2 px-2 text-xs text-muted font-medium">Estado</th>
              <th className="text-left py-2 px-2 text-xs text-muted font-medium hidden md:table-cell">Pago</th>
              <th className="py-2 px-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted text-sm">Sin resultados</td>
              </tr>
            )}
            {filtered.map((m) => {
              const st = statusMap[m.status] ?? statusMap.cancelled;
              const soon = m.status === "active" && isExpiringSoon(m.end_date);
              return (
                <tr key={m.id} className="hover:bg-dark-alt/50 transition-colors">
                  <td className="py-3 px-2 font-medium text-foreground">
                    {m.client?.[0]?.name ?? "—"}
                    {m.client?.[0]?.phone && (
                      <p className="text-xs text-muted">{m.client[0].phone}</p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-muted hidden sm:table-cell">
                    {m.membership_type?.[0]?.name ?? "—"}
                  </td>
                  <td className="py-3 px-2">
                    <span className={cn("text-sm", soon && "text-amber-400 font-medium")}>
                      {fmt(m.end_date)}
                      {soon && <span className="ml-1 text-xs">(pronto)</span>}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell">
                    <span className={`text-xs ${m.paid ? "text-emerald-400" : "text-amber-400"}`}>
                      {m.paid ? "Pagado" : "Pendiente"}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {m.status === "active" && (
                      <form action={cancelMembership.bind(null, m.id)}>
                        <button type="submit" title="Cancelar membresía" className="text-muted hover:text-red-400 transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
