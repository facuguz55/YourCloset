import { createClient } from "@/lib/supabase/server";
import type { MembershipType, SiteConfigMap, SiteConfigKey } from "@/types/database";

export async function getMembershipTypes(): Promise<MembershipType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membership_types")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching membership types:", error);
    return [];
  }
  return data ?? [];
}

export async function getSiteConfig(): Promise<SiteConfigMap> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_config")
    .select("key, value");

  if (error) {
    console.error("Error fetching site config:", error);
    return {};
  }

  return (data ?? []).reduce<SiteConfigMap>((acc, row) => {
    acc[row.key as SiteConfigKey] = row.value ?? undefined;
    return acc;
  }, {});
}

export async function isMaintenanceMode(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "maintenance_mode")
    .single();

  return data?.value === "true";
}
