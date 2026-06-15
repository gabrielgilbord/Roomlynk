import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InquilinoDashboard } from "@/components/dashboard/inquilino-dashboard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function InquilinoPage() {
  const profile = await requireRole(["inquilino", "superadmin"]);
  const supabase = await createClient();

  const [{ data: room }, { data: contract }] = await Promise.all([
    supabase
      .from("rooms")
      .select("*, properties(name, address, city)")
      .eq("tenant_id", profile.id)
      .maybeSingle(),
    supabase
      .from("contracts")
      .select("*")
      .eq("inquilino_id", profile.id)
      .eq("status", "firmado")
      .maybeSingle(),
  ]);

  const { data: expenses } = room
    ? await supabase
        .from("expenses")
        .select("*")
        .eq("room_id", room.id)
        .order("due_date", { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <DashboardShell profile={profile} activePath="/dashboard/inquilino">
      <InquilinoDashboard
        profile={profile}
        room={room}
        contract={contract}
        expenses={expenses ?? []}
      />
    </DashboardShell>
  );
}
