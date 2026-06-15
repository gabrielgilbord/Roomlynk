import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SuperadminDashboard } from "@/components/dashboard/superadmin-dashboard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ContractStatus } from "@/types/database";

type RecentContractRow = {
  id: string;
  status: ContractStatus;
  created_at: string;
  rooms: unknown;
};

export default async function SuperadminPage() {
  const profile = await requireRole(["superadmin"]);
  const supabase = await createClient();

  const [
    { count: caserosCount },
    { count: contractsCount },
    { count: propertiesCount },
    { data: recentContracts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "casero"),
    supabase.from("contracts").select("*", { count: "exact", head: true }).eq("status", "firmado"),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase
      .from("contracts")
      .select("id, status, created_at, rooms(name, properties(name))")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <DashboardShell profile={profile} activePath="/dashboard/superadmin">
      <SuperadminDashboard
        caserosCount={caserosCount ?? 0}
        contractsCount={contractsCount ?? 0}
        propertiesCount={propertiesCount ?? 0}
        recentContracts={(recentContracts ?? []) as RecentContractRow[]}
      />
    </DashboardShell>
  );
}
