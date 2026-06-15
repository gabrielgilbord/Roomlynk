import { updateIncidentStatusAction } from "@/app/actions/incidents";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function IncidenciasCaseroPage() {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*, rooms(name), properties(name)")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell profile={profile} activePath="/dashboard/casero/incidencias">
      <div className="space-y-10">
        <header>
          <Link href="/dashboard/casero" className="text-xs text-ink-muted hover:text-ink">
            ← Resumen
          </Link>
          <h1 className="rl-display mt-2 text-3xl font-medium text-ink">Incidencias</h1>
        </header>

        <Card padding="none">
          <div className="divide-y divide-border">
            {(incidents ?? []).length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-ink-muted">Sin incidencias reportadas</p>
            ) : (
              incidents?.map((inc) => (
                <div key={inc.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{inc.title}</p>
                      <p className="mt-1 text-sm text-ink-muted">{inc.description}</p>
                      <p className="mt-2 text-xs text-ink-muted">
                        {(inc.properties as { name: string } | null)?.name} ·{" "}
                        {formatDate(inc.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={inc.priority === "alta" || inc.priority === "urgente" ? "rust" : "muted"}>
                        {inc.priority}
                      </Badge>
                      <Badge variant={inc.status === "resuelta" ? "forest" : "rust"}>{inc.status}</Badge>
                    </div>
                  </div>
                  {inc.status === "abierta" && (
                    <form
                      action={async () => {
                        "use server";
                        await updateIncidentStatusAction(inc.id, "en_progreso", "Operario asignado");
                      }}
                      className="mt-3"
                    >
                      <Button type="submit" variant="outline" size="sm">
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
                      className="mt-3"
                    >
                      <Button type="submit" variant="secondary" size="sm">
                        Marcar resuelta
                      </Button>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
