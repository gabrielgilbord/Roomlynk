import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyForm } from "@/components/properties/property-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function PropiedadesPage() {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("*, rooms(*)")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell profile={profile} activePath="/dashboard/casero/propiedades">
      <div className="space-y-10">
        <header>
          <Link
            href="/dashboard/casero"
            className="text-xs text-ink-muted hover:text-ink"
          >
            ← Resumen
          </Link>
          <h1 className="rl-display mt-2 text-3xl font-medium text-ink">
            Inmuebles
          </h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <h2 className="mb-6 text-sm font-semibold text-ink">
              Registrar nuevo inmueble
            </h2>
            <PropertyForm />
          </Card>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-ink">Tus inmuebles</h2>
            {(properties ?? []).length === 0 ? (
              <Card>
                <p className="text-sm text-ink-muted">
                  Cuando registres un inmueble aparecerá aquí.
                </p>
              </Card>
            ) : (
              (properties ?? []).map((property) => {
                const rooms = property.rooms ?? [];
                return (
                  <Card key={property.id} padding="sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-ink">{property.name}</p>
                        <p className="text-xs text-ink-muted">
                          {property.address}, {property.city}
                        </p>
                      </div>
                      <Badge variant="forest">{rooms.length} hab.</Badge>
                    </div>
                    {rooms.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-border pt-3">
                        {rooms.map((room: { id: string; name: string; monthly_rent: number; is_occupied: boolean }) => (
                          <div
                            key={room.id}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-ink-muted">{room.name}</span>
                            <span className="text-ink">
                              {formatCurrency(Number(room.monthly_rent))}
                              {room.is_occupied ? " · Ocupada" : " · Libre"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
