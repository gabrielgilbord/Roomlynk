import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
        <Link href="/dashboard/superadmin" className="text-xs text-ink-muted hover:text-ink">← Resumen</Link>
        <h1 className="rl-display text-3xl font-medium text-ink">Plantillas legales</h1>
        <div className="space-y-4">
          {(templates ?? []).map((t) => (
            <Card key={t.id}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-muted">{t.slug} · v{t.version}</p>
                </div>
                <Badge variant={t.is_active ? "forest" : "muted"}>
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
