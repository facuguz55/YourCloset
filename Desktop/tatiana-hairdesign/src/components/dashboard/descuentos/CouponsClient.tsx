"use client";

import { useState, useTransition, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/app/actions/coupons";
import { cn } from "@/lib/utils";
import { Plus, Search, Trash2, ToggleLeft, ToggleRight, Ticket } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_pct: number;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  created_at: string;
}

interface Props {
  coupons: Coupon[];
}

function fmt(d: string) {
  return format(new Date(d + "T00:00:00"), "d MMM yyyy", { locale: es });
}

export function CouponsClient({ coupons: initial }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const filtered = initial.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createCoupon(formData);
      formRef.current?.reset();
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cupón…"
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50"
          />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-gold text-dark px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo cupón
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl bg-dark-card border border-gold/20 p-4">
          <h3 className="font-semibold text-foreground text-sm mb-4">Crear cupón</h3>
          <form ref={formRef} action={handleCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs text-muted mb-1">Código</label>
              <input
                name="code"
                required
                placeholder="Ej: PROMO20"
                className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50 uppercase"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Descuento %</label>
              <input
                name="discount_pct"
                type="number"
                min={1}
                max={100}
                required
                placeholder="20"
                className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Vence (opcional)</label>
              <input
                name="valid_until"
                type="date"
                className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Usos máx. (opcional)</label>
              <input
                name="max_uses"
                type="number"
                min={1}
                placeholder="Sin límite"
                className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="bg-gold text-dark px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-60"
              >
                {isPending ? "Creando…" : "Crear cupón"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
          {success && <p className="text-xs text-emerald-400 mt-2">Cupón creado correctamente</p>}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-dark-card border border-dark-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Ticket className="w-10 h-10 text-muted-dark" />
            <p className="text-sm text-muted">Sin cupones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Código</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Descuento</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium hidden sm:table-cell">Vencimiento</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Usos</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Estado</th>
                  <th className="py-3 px-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-dark-alt/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-foreground">{c.code}</td>
                    <td className="py-3 px-4 text-gold font-medium">{c.discount_pct}%</td>
                    <td className="py-3 px-4 text-muted hidden sm:table-cell">
                      {c.valid_until ? fmt(c.valid_until) : "Sin límite"}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {c.current_uses}{c.max_uses ? `/${c.max_uses}` : ""}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-dark-alt text-muted"
                      )}>
                        {c.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleCoupon.bind(null, c.id, !c.active)}>
                          <button type="submit" title={c.active ? "Desactivar" : "Activar"} className="text-muted hover:text-gold transition-colors">
                            {c.active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                        </form>
                        <form action={deleteCoupon.bind(null, c.id)}>
                          <button type="submit" title="Eliminar" className="text-muted hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
