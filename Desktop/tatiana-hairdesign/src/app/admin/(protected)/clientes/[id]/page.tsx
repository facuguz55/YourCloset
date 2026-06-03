import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { ClientEditForm } from "@/components/dashboard/clientes/ClientEditForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const statusMap: Record<string, { label: string; cls: string }> = {
  active:    { label: "Activa",    cls: "bg-emerald-500/15 text-emerald-400" },
  expired:   { label: "Vencida",   cls: "bg-red-500/15 text-red-400" },
  cancelled: { label: "Cancelada", cls: "bg-dark-alt text-muted" },
};

const branchLabels: Record<string, string> = {
  larioja: "La Rioja 2718",
  miraflores: "Complejo Miraflores",
  moreno: "Moreno 2599",
};

function fmt(d: string) {
  return format(new Date(d + "T00:00:00"), "d 'de' MMMM yyyy", { locale: es });
}

export default async function ClientProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: memberships } = await supabase
    .from("client_memberships")
    .select(`
      id, start_date, end_date, status, paid, notes, created_at,
      membership_type:membership_types(name, price)
    `)
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const activeMembership = memberships?.find((m) => m.status === "active");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/clientes" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl font-semibold text-foreground">{client.name}</h1>
        {activeMembership && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
            Membresía activa
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Info */}
        <div className="rounded-xl bg-dark-card border border-dark-border p-4 space-y-3">
          <h2 className="font-semibold text-foreground text-sm">Información</h2>
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Phone className="w-4 h-4 text-muted-dark" />
              <a href={`tel:${client.phone}`} className="hover:text-gold">{client.phone}</a>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Mail className="w-4 h-4 text-muted-dark" />
              <a href={`mailto:${client.email}`} className="hover:text-gold">{client.email}</a>
            </div>
          )}
          {client.branch && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="w-4 h-4 text-muted-dark" />
              {branchLabels[client.branch] ?? client.branch}
            </div>
          )}
          {client.notes && (
            <div className="mt-3 pt-3 border-t border-dark-border">
              <p className="text-xs text-muted mb-1">Notas internas</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
          <p className="text-xs text-muted pt-1">
            Cliente desde {format(new Date(client.created_at), "MMMM yyyy", { locale: es })}
          </p>
        </div>

        {/* Edit form */}
        <ClientEditForm client={client} />
      </div>

      {/* Membership history */}
      <div className="rounded-xl bg-dark-card border border-dark-border p-4">
        <h2 className="font-semibold text-foreground text-sm mb-4">Historial de membresías</h2>
        {!memberships || memberships.length === 0 ? (
          <p className="text-sm text-muted">Sin membresías registradas</p>
        ) : (
          <ul className="divide-y divide-dark-border">
            {memberships.map((m) => {
              const st = statusMap[m.status] ?? statusMap.cancelled;
              return (
                <li key={m.id} className="py-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {m.membership_type?.[0]?.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {fmt(m.start_date)} → {fmt(m.end_date)}
                    </p>
                    {m.notes && <p className="text-xs text-muted mt-1 italic">{m.notes}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                    <p className={`text-xs mt-1 ${m.paid ? "text-emerald-400" : "text-amber-400"}`}>
                      {m.paid ? "Pagado" : "Pendiente"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
