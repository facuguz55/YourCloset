"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function registerMembership(formData: FormData) {
  const supabase = await createClient();
  const client_id = String(formData.get("client_id") ?? "").trim();
  const membership_type_id = String(formData.get("membership_type_id") ?? "").trim();
  const start_date = String(formData.get("start_date") ?? "");
  const end_date = String(formData.get("end_date") ?? "");
  const paid = formData.get("paid") === "true";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!client_id || !membership_type_id || !start_date || !end_date) return;

  // Expire previous active memberships for this client
  await supabase
    .from("client_memberships")
    .update({ status: "expired" })
    .eq("client_id", client_id)
    .eq("status", "active");

  await supabase.from("client_memberships").insert({
    client_id,
    membership_type_id,
    start_date,
    end_date,
    status: "active",
    paid,
    notes,
  });

  revalidatePath("/admin/membresias");
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${client_id}`);
}

export async function cancelMembership(id: string) {
  const supabase = await createClient();
  await supabase.from("client_memberships").update({ status: "cancelled" }).eq("id", id);
  revalidatePath("/admin/membresias");
}
