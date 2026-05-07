"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleMaintenance(enabled: boolean) {
  const supabase = await createClient();
  await supabase
    .from("site_config")
    .update({ value: enabled ? "true" : "false", updated_at: new Date().toISOString() })
    .eq("key", "maintenance_mode");
  revalidatePath("/");
  revalidatePath("/admin/inicio");
}

export async function updateSiteConfig(key: string, value: string) {
  const supabase = await createClient();
  await supabase
    .from("site_config")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);
  revalidatePath("/");
}

export async function updateMultipleConfigs(updates: Record<string, string>) {
  const supabase = await createClient();
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      supabase
        .from("site_config")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/configuracion");
}
