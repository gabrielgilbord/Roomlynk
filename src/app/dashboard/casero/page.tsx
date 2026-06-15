import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CaseroDashboard } from "@/components/dashboard/casero-dashboard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CaseroPage() {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const [{ count: propertiesCount }, { data: properties }, { count: contractsCount }, { data: incidents }] =
    await Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("properties").select("*, rooms(*)").order("created_at", { ascending: false }).limit(5),
      supabase.from("contracts").select("*", { count: "exact", head: true }).eq("status", "firmado"),
      supabase
        .from("incidents")
        .select("*")
        .in("status", ["abierta", "en_progreso"])
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <DashboardShell profile={profile} activePath="/dashboard/casero">
      <CaseroDashboard
        profile={profile}
        properties={properties ?? []}
        propertiesCount={propertiesCount ?? 0}
        contractsCount={contractsCount ?? 0}
        incidents={incidents ?? []}
      />
    </DashboardShell>
  );
}
