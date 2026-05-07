import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight } from "lucide-react";

interface Membership {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  paid: boolean;
  // Supabase returns joined rows as arrays
  client: { name: string; phone: string | null }[] | null;
  membership_type: { name: string; price: number }[] | null;
}

interface Props {
  memberships: Membership[];
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  active: { label: "Activa", cls: "bg-emerald-500/15 text-emerald-400" },
  expired: { label: "Vencida", cls: "bg-red-500/15 text-red-400" },
  cancelled: { label: "Cancelada", cls: "bg-muted-dark/30 text-muted" },
};

function fmt(d: string) {
  return format(new Date(d + "T00:00:00"), "d MMM yyyy", { locale: es });
}

export function RecentMemberships({ memberships }: Props) {
  return (
    <div className="rounded-xl bg-dark-card border border-dark-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-sm">Membresías recientes</h2>
        <Link
          href="/admin/membresias"
          className="text-xs text-gold hover:text-gold-light flex items-center gap-1"
        >
          Ver todas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {memberships.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">Sin registros</p>
      ) : (
        <ul className="divide-y divide-dark-border">
          {memberships.map((m) => {
            const st = statusLabel[m.status] ?? statusLabel.cancelled;
            return (
              <li key={m.id} className="py-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {m.client?.[0]?.name ?? "—"}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {m.membership_type?.[0]?.name ?? "—"} · vence {fmt(m.end_date)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}
                >
                  {st.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
