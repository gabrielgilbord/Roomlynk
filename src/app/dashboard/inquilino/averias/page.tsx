import { DashboardShell } from "@/components/layout/dashboard-shell";
import { IncidentForm } from "@/components/incidents/incident-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AveriasInquilinoPage() {
  const profile = await requireRole(["inquilino", "superadmin"]);
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, property_id, properties(name)")
    .eq("tenant_id", profile.id)
    .maybeSingle();

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*")
    .eq("reported_by", profile.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell profile={profile} activePath="/dashboard/inquilino/averias">
      <div className="space-y-8">
        <PageHeader
          backHref="/dashboard/inquilino"
          backLabel="← Inicio"
          title="Reportar avería"
        />

        {!room ? (
          <Card>
            <p className="text-sm text-ink-muted">
              Necesitas tener una habitación asignada para reportar averías.
            </p>
          </Card>
        ) : (
          <Card className="min-w-0">
            <h2 className="mb-4 text-sm font-semibold text-ink">Nueva incidencia</h2>
            <IncidentForm propertyId={room.property_id} roomId={room.id} />
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">Mis reportes</h2>
          {(incidents ?? []).length === 0 ? (
            <Card>
              <p className="py-8 text-center text-sm text-ink-muted">Sin averías reportadas</p>
            </Card>
          ) : (
            incidents?.map((inc) => (
              <Card key={inc.id} padding="sm" className="min-w-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{inc.title}</p>
                    <p className="mt-1 text-xs text-ink-muted">{formatDate(inc.created_at)}</p>
                  </div>
                  <Badge variant={inc.status === "resuelta" ? "forest" : "rust"} className="w-fit">
                    {inc.status}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
