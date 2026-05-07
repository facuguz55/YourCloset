import { createClient } from "@/lib/supabase/server";
import { ClientsClient } from "@/components/dashboard/clientes/ClientsClient";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select(`
      id, name, phone, email, notes, branch, created_at,
      client_memberships(id, status, end_date, membership_type:membership_types(name))
    `)
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Clientes</h1>
      <ClientsClient clients={clients ?? []} />
    </div>
  );
}
