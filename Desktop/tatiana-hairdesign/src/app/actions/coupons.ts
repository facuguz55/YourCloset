"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCoupon(formData: FormData) {
  const supabase = await createClient();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discount_pct = Number(formData.get("discount_pct") ?? 0);
  const valid_until = formData.get("valid_until") ? String(formData.get("valid_until")) : null;
  const max_uses = formData.get("max_uses") ? Number(formData.get("max_uses")) : null;

  if (!code || discount_pct <= 0 || discount_pct > 100) return;

  await supabase.from("coupons").insert({
    code,
    discount_pct,
    valid_until,
    max_uses,
    current_uses: 0,
    active: true,
  });

  revalidatePath("/admin/descuentos");
}

export async function toggleCoupon(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("coupons").update({ active }).eq("id", id);
  revalidatePath("/admin/descuentos");
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient();
  await supabase.from("coupons").delete().eq("id", id);
  revalidatePath("/admin/descuentos");
}
