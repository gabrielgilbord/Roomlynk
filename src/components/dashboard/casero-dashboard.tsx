import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">Buenos días, {firstName}</p>
          <h1 className="rl-display mt-1 text-3xl font-medium text-ink">
            Tu cartera de inmuebles
          </h1>
        </div>
        <Link href="/dashboard/casero/propiedades">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo inmueble
          </Button>
        </Link>
      </header>

      {/* Métricas — fila horizontal, no 4 cards iguales */}
      <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
        {[
          { label: "Inmuebles", value: propertiesCount },
          { label: "Habitaciones", value: `${occupiedRooms}/${totalRooms}` },
          { label: "Contratos activos", value: contractsCount },
          { label: "Ingresos/mes", value: formatCurrency(monthlyRevenue) },
        ].map((stat) => (
          <div key={stat.label} className="bg-paper px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              {stat.label}
            </p>
            <p className="rl-display mt-1 text-2xl font-medium text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inmuebles */}
        <Card className="lg:col-span-3" padding="none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Inmuebles</h2>
            <Link
              href="/dashboard/casero/propiedades"
              className="flex items-center gap-1 text-xs text-rust hover:underline"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {properties.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Building2 className="mx-auto h-8 w-8 text-ink-muted/40" />
                <p className="mt-3 text-sm text-ink-muted">
                  Aún no tienes inmuebles registrados.
                </p>
                <Link href="/dashboard/casero/propiedades">
                  <Button variant="outline" size="sm" className="mt-4">
                    Añadir el primero
                  </Button>
                </Link>
              </div>
            ) : (
              properties.map((property) => {
                const rooms = property.rooms ?? [];
                const occupied = rooms.filter((r) => r.is_occupied).length;
                const revenue = rooms
                  .filter((r) => r.is_occupied)
                  .reduce((s, r) => s + Number(r.monthly_rent), 0);

                return (
                  <div
                    key={property.id}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div>
                      <p className="font-medium text-ink">{property.name}</p>
                      <p className="text-xs text-ink-muted">
                        {property.address}, {property.city} · {occupied}/{rooms.length} hab.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-forest">
                      {formatCurrency(revenue)}/mes
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Incidencias */}
        <Card className="lg:col-span-2" padding="none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Incidencias abiertas</h2>
            {incidents.length > 0 && (
              <Badge variant="rust">{incidents.length}</Badge>
            )}
          </div>
          <div className="divide-y divide-border">
            {incidents.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-muted">
                Sin incidencias pendientes
              </p>
            ) : (
              incidents.map((inc) => (
                <div key={inc.id} className="px-5 py-3">
                  <p className="text-sm text-ink">{inc.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={inc.priority === "alta" ? "rust" : "muted"}>
                      {inc.priority}
                    </Badge>
                    <span className="text-xs text-ink-muted">{inc.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* CTA contratos */}
      <Card className="flex items-center justify-between bg-forest-light border-forest/20">
        <div className="flex items-center gap-4">
          <FileSignature className="h-6 w-6 text-forest" />
          <div>
            <p className="text-sm font-medium text-ink">Invitar inquilino</p>
            <p className="text-xs text-ink-muted">
              Genera un enlace con contrato y firma digital integrada.
            </p>
          </div>
        </div>
        <Link href="/dashboard/casero/contratos">
          <Button variant="secondary" size="sm">
            Nueva invitación
          </Button>
        </Link>
      </Card>
    </div>
  );
}
