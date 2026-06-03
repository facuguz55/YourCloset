import { createClient } from "@/lib/supabase/server";
import { MembershipTable } from "@/components/dashboard/membresias/MembershipTable";
import { RegisterMembershipForm } from "@/components/dashboard/membresias/RegisterMembershipForm";

export const dynamic = "force-dynamic";

export default async function MembresiasPage() {
  const supabase = await createClient();

  const [{ data: memberships }, { data: clients }, { data: types }] = await Promise.all([
    supabase
      .from("client_memberships")
      .select(`
        id, start_date, end_date, status, paid, notes, created_at,
        client:clients(id, name, phone),
        membership_type:membership_types(id, name, price)
      `)
      .order("created_at", { ascending: false })
      .limit(100),

    supabase.from("clients").select("id, name, phone").order("name"),

    supabase.from("membership_types").select("id, name, price").eq("active", true).order("price"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Membresías</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MembershipTable memberships={memberships ?? []} />
        </div>
        <div>
          <RegisterMembershipForm clients={clients ?? []} types={types ?? []} />
        </div>
      </div>
    </div>
  );
}
