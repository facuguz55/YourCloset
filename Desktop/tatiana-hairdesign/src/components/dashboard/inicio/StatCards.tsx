import { Users, CreditCard, Ticket, AlertTriangle } from "lucide-react";

interface Props {
  activeMemberships: number;
  expiringMemberships: number;
  totalClients: number;
  activeCoupons: number;
}

const cards = (p: Props) => [
  {
    label: "Membresías activas",
    value: p.activeMemberships,
    icon: CreditCard,
    accent: "text-gold",
    bg: "bg-gold/10",
  },
  {
    label: "Vencen en 7 días",
    value: p.expiringMemberships,
    icon: AlertTriangle,
    accent: p.expiringMemberships > 0 ? "text-amber-400" : "text-muted",
    bg: p.expiringMemberships > 0 ? "bg-amber-400/10" : "bg-dark-alt",
  },
  {
    label: "Clientes totales",
    value: p.totalClients,
    icon: Users,
    accent: "text-gold",
    bg: "bg-gold/10",
  },
  {
    label: "Cupones activos",
    value: p.activeCoupons,
    icon: Ticket,
    accent: "text-gold",
    bg: "bg-gold/10",
  },
];

export function StatCards(props: Props) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards(props).map((c) => (
        <div
          key={c.label}
          className="rounded-xl bg-dark-card border border-dark-border p-4 flex flex-col gap-3"
        >
          <div className={`${c.bg} w-9 h-9 rounded-lg flex items-center justify-center`}>
            <c.icon className={`w-5 h-5 ${c.accent}`} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{c.value}</p>
            <p className="text-xs text-muted mt-0.5">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
