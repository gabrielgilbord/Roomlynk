import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PlantillasSuperadminPage() {
  const profile = await requireRole(["superadmin"]);
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("contract_templates")
    .select("*")
    .order("created_at");

  return (
    <DashboardShell profile={profile} activePath="/dashboard/superadmin/plantillas">
      <div className="space-y-8">
        <PageHeader
          backHref="/dashboard/superadmin"
          backLabel="← Resumen"
          title="Plantillas legales"
        />

        <div className="space-y-3">
          {(templates ?? []).map((t) => (
            <Card key={t.id} padding="sm" className="min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-muted">
                    {t.slug} · v{t.version}
                  </p>
                </div>
                <Badge variant={t.is_active ? "forest" : "muted"} className="w-fit shrink-0">
                  {t.is_active ? "activa" : "inactiva"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
