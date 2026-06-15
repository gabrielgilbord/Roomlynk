import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
        <PageHeader
          backHref="/dashboard/superadmin"
          backLabel="← Resumen"
          title="Caseros"
        />

        {(caseros ?? []).length === 0 ? (
          <Card>
            <p className="py-8 text-center text-sm text-ink-muted">Sin caseros registrados</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {caseros?.map((c) => (
              <Card key={c.id} padding="sm" className="min-w-0">
                <ListRow actions={<Badge variant="forest">activo</Badge>}>
                  <p className="text-sm font-medium text-ink">{c.full_name}</p>
                  <p className="truncate text-xs text-ink-muted">{c.email}</p>
                </ListRow>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
