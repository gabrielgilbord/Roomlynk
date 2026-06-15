import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyForm } from "@/components/properties/property-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export default async function PropiedadesPage() {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("*, rooms(*)")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell profile={profile} activePath="/dashboard/casero/propiedades">
      <div className="space-y-8">
        <PageHeader
          backHref="/dashboard/casero"
          backLabel="← Resumen"
          title="Inmuebles"
        />

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Card className="min-w-0">
            <h2 className="mb-6 text-sm font-semibold text-ink">Registrar nuevo inmueble</h2>
            <PropertyForm />
          </Card>

          <div className="min-w-0 space-y-4">
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
                  <Card key={property.id} padding="sm" className="min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{property.name}</p>
                        <p className="text-xs text-ink-muted">
                          {property.address}, {property.city}
                        </p>
                      </div>
                      <Badge variant="forest" className="w-fit shrink-0">
                        {rooms.length} hab.
                      </Badge>
                    </div>
                    {rooms.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        {rooms.map(
                          (room: {
                            id: string;
                            name: string;
                            monthly_rent: number;
                            is_occupied: boolean;
                          }) => (
                            <div
                              key={room.id}
                              className="flex flex-col gap-0.5 text-xs sm:flex-row sm:justify-between"
                            >
                              <span className="text-ink-muted">{room.name}</span>
                              <span className="text-ink">
                                {formatCurrency(Number(room.monthly_rent))}
                                {room.is_occupied ? " · Ocupada" : " · Libre"}
                              </span>
                            </div>
                          )
                        )}
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
