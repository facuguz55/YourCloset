import { createClient } from "@/lib/supabase/server";
import { CouponsClient } from "@/components/dashboard/descuentos/CouponsClient";

export const dynamic = "force-dynamic";

export default async function DescuentosPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">Descuentos & Cupones</h1>
      <CouponsClient coupons={coupons ?? []} />
    </div>
  );
}
