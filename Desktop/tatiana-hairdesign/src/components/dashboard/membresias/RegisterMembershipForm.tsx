"use client";

import { useRef, useState, useTransition } from "react";
import { registerMembership } from "@/app/actions/memberships";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";

interface Client { id: string; name: string; phone: string | null }
interface Type { id: string; name: string; price: number }

interface Props {
  clients: Client[];
  types: Type[];
}

export function RegisterMembershipForm({ clients, types }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const nextMonth = format(new Date(Date.now() + 30 * 86400000), "yyyy-MM-dd");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await registerMembership(formData);
      setSuccess(true);
      formRef.current?.reset();
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  return (
    <div className="rounded-xl bg-dark-card border border-dark-border p-4">
      <h2 className="font-semibold text-foreground text-sm mb-4">Registrar nueva membresía</h2>

      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-muted mb-1">Cliente</label>
          <select
            name="client_id"
            required
            className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
          >
            <option value="">Seleccionar cliente…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ""}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Plan</label>
          <select
            name="membership_type_id"
            required
            className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
          >
            <option value="">Seleccionar plan…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name} — {formatPrice(t.price)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-muted mb-1">Inicio</label>
            <input
              type="date"
              name="start_date"
              required
              defaultValue={today}
              className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Vencimiento</label>
            <input
              type="date"
              name="end_date"
              required
              defaultValue={nextMonth}
              className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="paid"
            id="paid"
            value="true"
            className="accent-gold w-4 h-4"
            defaultChecked
          />
          <label htmlFor="paid" className="text-sm text-foreground">Pago recibido</label>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Notas (opcional)</label>
          <textarea
            name="notes"
            rows={2}
            className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50 resize-none"
            placeholder="Observaciones internas…"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gold text-dark py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-60"
        >
          {isPending ? "Registrando…" : "Registrar membresía"}
        </button>

        {success && (
          <p className="text-center text-xs text-emerald-400">Membresía registrada correctamente</p>
        )}
      </form>
    </div>
  );
}
