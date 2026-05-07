"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { createClient_ } from "@/app/actions/clients";
import { Search, Plus, UserCircle, Phone, CreditCard, ChevronRight, X } from "lucide-react";

interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  branch: string | null;
  created_at: string;
  client_memberships: {
    id: string;
    status: string;
    end_date: string;
    membership_type: { name: string }[] | null;
  }[];
}

interface Props {
  clients: ClientRow[];
}

const BRANCHES = [
  { value: "larioja", label: "La Rioja 2718" },
  { value: "miraflores", label: "Miraflores" },
  { value: "moreno", label: "Moreno 2599" },
];

export function ClientsClient({ clients }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createClient_(formData);
      formRef.current?.reset();
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  function getActiveMembership(c: ClientRow) {
    return c.client_memberships?.find((m) => m.status === "active") ?? null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email…"
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50"
          />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-gold text-dark px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-dark-card border border-gold/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm">Agregar cliente</h3>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form ref={formRef} action={handleCreate} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-muted mb-1">Nombre *</label>
              <input name="name" required placeholder="María García" className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Teléfono</label>
              <input name="phone" placeholder="+549342…" className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Email</label>
              <input name="email" type="email" placeholder="mail@ejemplo.com" className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Sucursal preferida</label>
              <select name="branch" className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50">
                <option value="">Sin especificar</option>
                {BRANCHES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Notas internas</label>
              <textarea name="notes" rows={2} placeholder="Observaciones…" className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={isPending} className="bg-gold text-dark px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-60">
                {isPending ? "Guardando…" : "Guardar cliente"}
              </button>
            </div>
          </form>
          {success && <p className="text-xs text-emerald-400 mt-2">Cliente agregado correctamente</p>}
        </div>
      )}

      {/* List */}
      <p className="text-xs text-muted">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</p>

      <div className="rounded-xl bg-dark-card border border-dark-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <UserCircle className="w-10 h-10 text-muted-dark" />
            <p className="text-sm text-muted">Sin clientes{search ? " que coincidan" : ""}</p>
          </div>
        ) : (
          <ul className="divide-y divide-dark-border">
            {filtered.map((c) => {
              const active = getActiveMembership(c);
              return (
                <li key={c.id}>
                  <Link
                    href={`/admin/clientes/${c.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-dark-alt/50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <span className="text-gold text-sm font-semibold">{c.name[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {c.phone && (
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Phone className="w-3 h-3" />{c.phone}
                          </span>
                        )}
                        {active && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CreditCard className="w-3 h-3" />
                            {active.membership_type?.[0]?.name ?? "Membresía activa"}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-gold transition-colors" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
