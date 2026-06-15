import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { formatCurrency } from "@/lib/utils";
import type { Incident, Profile, Property, Room } from "@/types/database";
import { ArrowRight, Building2, FileSignature, Plus } from "lucide-react";
import Link from "next/link";

type PropertyWithRooms = Property & { rooms: Room[] };

interface CaseroDashboardProps {
  profile: Profile;
  properties: PropertyWithRooms[];
  propertiesCount: number;
  contractsCount: number;
  incidents: Incident[];
}

export function CaseroDashboard({
  profile,
  properties,
  propertiesCount,
  contractsCount,
  incidents,
}: CaseroDashboardProps) {
  const totalRooms = properties.reduce((acc, p) => acc + (p.rooms?.length ?? 0), 0);
  const occupiedRooms = properties.reduce(
    (acc, p) => acc + (p.rooms?.filter((r) => r.is_occupied).length ?? 0),
    0
  );
  const monthlyRevenue = properties.reduce(
    (acc, p) =>
      acc +
      (p.rooms?.filter((r) => r.is_occupied).reduce((s, r) => s + Number(r.monthly_rent), 0) ?? 0),
    0
  );

  const firstName = profile.full_name?.split(" ")[0] ?? "Casero";

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        subtitle={`Buenos días, ${firstName}`}
        title="Tu cartera de inmuebles"
        action={
          <Link href="/dashboard/casero/propiedades" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nuevo inmueble
            </Button>
          </Link>
        }
      />

      <StatGrid
        stats={[
          { label: "Inmuebles", value: propertiesCount },
          { label: "Habitaciones", value: `${occupiedRooms}/${totalRooms}` },
          { label: "Contratos activos", value: contractsCount },
          { label: "Ingresos/mes", value: formatCurrency(monthlyRevenue) },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-3" padding="none">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
            <h2 className="text-sm font-semibold text-ink">Inmuebles</h2>
            <Link
              href="/dashboard/casero/propiedades"
              className="flex items-center gap-1 text-xs text-rust hover:underline"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {properties.length === 0 ? (
            <div className="px-4 py-12 text-center sm:px-5">
              <Building2 className="mx-auto h-8 w-8 text-ink-muted/40" />
              <p className="mt-3 text-sm text-ink-muted">Aún no tienes inmuebles registrados.</p>
              <Link href="/dashboard/casero/propiedades">
                <Button variant="outline" size="sm" className="mt-4">
                  Añadir el primero
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {properties.map((property) => {
                const rooms = property.rooms ?? [];
                const occupied = rooms.filter((r) => r.is_occupied).length;
                const revenue = rooms
                  .filter((r) => r.is_occupied)
                  .reduce((s, r) => s + Number(r.monthly_rent), 0);

                return (
                  <ListRow
                    key={property.id}
                    actions={
                      <p className="text-sm font-medium text-forest">
                        {formatCurrency(revenue)}/mes
                      </p>
                    }
                  >
                    <p className="font-medium text-ink">{property.name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {property.address}, {property.city} · {occupied}/{rooms.length} hab.
                    </p>
                  </ListRow>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="min-w-0 lg:col-span-2" padding="none">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
            <h2 className="text-sm font-semibold text-ink">Incidencias abiertas</h2>
            {incidents.length > 0 && <Badge variant="rust">{incidents.length}</Badge>}
          </div>
          {incidents.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-muted sm:px-5">
              Sin incidencias pendientes
            </p>
          ) : (
            <div className="space-y-3 p-4 sm:space-y-0 sm:divide-y sm:divide-border sm:p-0">
              {incidents.map((inc) => (
                <div key={inc.id} className="rounded-sm border border-border p-4 sm:border-0 sm:px-5 sm:py-3">
                  <p className="text-sm text-ink">{inc.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={inc.priority === "alta" ? "rust" : "muted"}>
                      {inc.priority}
                    </Badge>
                    <span className="text-xs text-ink-muted">{inc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="flex flex-col gap-4 bg-forest-light border-forest/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <FileSignature className="h-6 w-6 shrink-0 text-forest" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Invitar inquilino</p>
            <p className="text-xs text-ink-muted">
              Genera un enlace con contrato y firma digital integrada.
            </p>
          </div>
        </div>
        <Link href="/dashboard/casero/contratos" className="w-full shrink-0 sm:w-auto">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto">
            Nueva invitación
          </Button>
        </Link>
      </Card>
    </div>
  );
}
