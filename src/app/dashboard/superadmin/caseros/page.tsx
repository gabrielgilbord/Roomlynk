import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CaserosSuperadminPage() {
  const profile = await requireRole(["superadmin"]);
  const supabase = await createClient();

  const { data: caseros } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "casero")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell profile={profile} activePath="/dashboard/superadmin/caseros">
      <div className="space-y-8">
        <Link href="/dashboard/superadmin" className="text-xs text-ink-muted hover:text-ink">← Resumen</Link>
        <h1 className="rl-display text-3xl font-medium text-ink">Caseros</h1>
        <Card padding="none">
          <div className="divide-y divide-border">
            {(caseros ?? []).map((c) => (
              <div key={c.id} className="flex justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{c.full_name}</p>
                  <p className="text-xs text-ink-muted">{c.email}</p>
                </div>
                <Badge variant="forest">activo</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
