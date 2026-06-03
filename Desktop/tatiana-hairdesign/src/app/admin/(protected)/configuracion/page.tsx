import { createClient } from "@/lib/supabase/server";
import { ConfigClient } from "@/components/dashboard/configuracion/ConfigClient";
import type { SiteConfigMap, SiteConfigKey } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase.from("site_config").select("key, value");

  const config: SiteConfigMap = (rows ?? []).reduce<SiteConfigMap>((acc, r) => {
    acc[r.key as SiteConfigKey] = r.value ?? undefined;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-foreground">Configuración</h1>
      <ConfigClient config={config} />
    </div>
  );
}
