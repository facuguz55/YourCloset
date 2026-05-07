"use client";

import { useTransition, useState } from "react";
import { updateClient } from "@/app/actions/clients";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  branch: string | null;
}

const BRANCHES = [
  { value: "larioja", label: "La Rioja 2718" },
  { value: "miraflores", label: "Miraflores" },
  { value: "moreno", label: "Moreno 2599" },
];

export function ClientEditForm({ client }: { client: Client }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateClient(client.id, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="rounded-xl bg-dark-card border border-dark-border p-4">
      <h2 className="font-semibold text-foreground text-sm mb-4">Editar datos</h2>
      <form action={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-muted mb-1">Nombre</label>
          <input name="name" required defaultValue={client.name} className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Teléfono</label>
          <input name="phone" defaultValue={client.phone ?? ""} className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Email</label>
          <input name="email" type="email" defaultValue={client.email ?? ""} className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Sucursal</label>
          <select name="branch" defaultValue={client.branch ?? ""} className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50">
            <option value="">Sin especificar</option>
            {BRANCHES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Notas</label>
          <textarea name="notes" rows={3} defaultValue={client.notes ?? ""} className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-none" />
        </div>
        <button type="submit" disabled={isPending} className="w-full bg-gold text-dark py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-60">
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>
        {saved && <p className="text-xs text-emerald-400 text-center">Guardado correctamente</p>}
      </form>
    </div>
  );
}
