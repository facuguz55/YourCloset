import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: configRows } = await supabase
    .from("site_config")
    .select("key, value")
    .eq("key", "maintenance_mode");

  const maintenance =
    configRows?.find((r) => r.key === "maintenance_mode")?.value === "true";

  return (
    <DashboardShell maintenanceMode={maintenance} userEmail={user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}
