"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClient_(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const branch = (formData.get("branch") as string) || null;

  if (!name) return;

  await supabase.from("clients").insert({ name, phone, email, notes, branch });
  revalidatePath("/admin/clientes");
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const branch = (formData.get("branch") as string) || null;

  if (!name) return;

  await supabase.from("clients").update({ name, phone, email, notes, branch }).eq("id", id);
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
}
