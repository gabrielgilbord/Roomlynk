import { updateIncidentStatusAction } from "@/app/actions/incidents";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function IncidenciasCaseroPage() {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*, rooms(name), properties(name)")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell profile={profile} activePath="/dashboard/casero/incidencias">
      <div className="space-y-8">
        <PageHeader
          backHref="/dashboard/casero"
          backLabel="← Resumen"
          title="Incidencias"
        />

        {(incidents ?? []).length === 0 ? (
          <Card>
            <p className="py-8 text-center text-sm text-ink-muted">Sin incidencias reportadas</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {incidents?.map((inc) => (
              <Card key={inc.id} padding="sm" className="min-w-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{inc.title}</p>
                    <p className="mt-1 text-sm text-ink-muted">{inc.description}</p>
                    <p className="mt-2 text-xs text-ink-muted">
                      {(inc.properties as { name: string } | null)?.name} ·{" "}
                      {formatDate(inc.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <Badge
                      variant={
                        inc.priority === "alta" || inc.priority === "urgente" ? "rust" : "muted"
                      }
                    >
                      {inc.priority}
                    </Badge>
                    <Badge variant={inc.status === "resuelta" ? "forest" : "rust"}>
                      {inc.status}
                    </Badge>
                  </div>
                </div>
                {inc.status === "abierta" && (
                  <form
                    action={async () => {
                      "use server";
                      await updateIncidentStatusAction(inc.id, "en_progreso", "Operario asignado");
                    }}
                    className="mt-4"
                  >
                    <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto">
                      Marcar en progreso
                    </Button>
                  </form>
                )}
                {inc.status === "en_progreso" && (
                  <form
                    action={async () => {
                      "use server";
                      await updateIncidentStatusAction(inc.id, "resuelta");
                    }}
                    className="mt-4"
                  >
                    <Button type="submit" variant="secondary" size="sm" className="w-full sm:w-auto">
                      Marcar resuelta
                    </Button>
                  </form>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
