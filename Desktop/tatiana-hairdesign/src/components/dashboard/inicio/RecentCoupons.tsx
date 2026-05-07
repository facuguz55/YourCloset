import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Ticket } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_pct: number;
  valid_until: string | null;
  current_uses: number;
  active: boolean;
}

interface Props {
  coupons: Coupon[];
}

export function RecentCoupons({ coupons }: Props) {
  return (
    <div className="rounded-xl bg-dark-card border border-dark-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-sm">Cupones recientes</h2>
        <Link
          href="/admin/descuentos"
          className="text-xs text-gold hover:text-gold-light flex items-center gap-1"
        >
          Ver todos <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {coupons.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">Sin cupones</p>
      ) : (
        <ul className="divide-y divide-dark-border">
          {coupons.map((c) => (
            <li key={c.id} className="py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <Ticket className="w-4 h-4 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-mono font-semibold text-foreground">{c.code}</p>
                <p className="text-xs text-muted mt-0.5">
                  {c.discount_pct}% de descuento
                  {c.valid_until
                    ? ` · hasta ${format(new Date(c.valid_until + "T00:00:00"), "d MMM", { locale: es })}`
                    : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted">{c.current_uses} usos</p>
                <span
                  className={`text-xs ${c.active ? "text-emerald-400" : "text-muted"}`}
                >
                  {c.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
