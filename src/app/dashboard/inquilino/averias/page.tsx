import { DashboardShell } from "@/components/layout/dashboard-shell";
import { IncidentForm } from "@/components/incidents/incident-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

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
        <header>
          <Link href="/dashboard/inquilino" className="text-xs text-ink-muted hover:text-ink">
            ← Inicio
          </Link>
          <h1 className="rl-display mt-2 text-3xl font-medium text-ink">Reportar avería</h1>
        </header>

        {!room ? (
          <Card>
            <p className="text-sm text-ink-muted">
              Necesitas tener una habitación asignada para reportar averías.
            </p>
          </Card>
        ) : (
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">Nueva incidencia</h2>
            <IncidentForm propertyId={room.property_id} roomId={room.id} />
          </Card>
        )}

        <Card padding="none">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Mis reportes</h2>
          </div>
          <div className="divide-y divide-border">
            {(incidents ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-ink-muted text-center">Sin averías reportadas</p>
            ) : (
              incidents?.map((inc) => (
                <div key={inc.id} className="px-5 py-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-ink">{inc.title}</p>
                    <Badge variant={inc.status === "resuelta" ? "forest" : "rust"}>{inc.status}</Badge>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{formatDate(inc.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
