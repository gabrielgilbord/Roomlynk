import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { ContractStatus } from "@/types/database";

function getPropertyName(rooms: unknown): string {
  if (!rooms || typeof rooms !== "object") return "—";
  const room = Array.isArray(rooms) ? rooms[0] : rooms;
  if (!room || typeof room !== "object" || !("properties" in room)) return "—";
  const props = (room as { properties: unknown }).properties;
  if (!props) return "—";
  const prop = Array.isArray(props) ? props[0] : props;
  return (prop as { name?: string })?.name ?? "—";
}

function getRoomName(rooms: unknown): string {
  if (!rooms || typeof rooms !== "object") return "";
  const room = Array.isArray(rooms) ? rooms[0] : rooms;
  return (room as { name?: string })?.name ?? "";
}

interface SuperadminDashboardProps {
  caserosCount: number;
  contractsCount: number;
  propertiesCount: number;
  recentContracts: {
    id: string;
    status: ContractStatus;
    created_at: string;
    rooms: unknown;
  }[];
}

const statusBadge: Record<ContractStatus, { label: string; variant: "forest" | "rust" | "muted" }> = {
  firmado: { label: "Firmado", variant: "forest" },
  pendiente_inquilino: { label: "Pendiente", variant: "rust" },
  borrador: { label: "Borrador", variant: "muted" },
  vencido: { label: "Vencido", variant: "muted" },
};

export function SuperadminDashboard({
  caserosCount,
  contractsCount,
  propertiesCount,
  recentContracts,
}: SuperadminDashboardProps) {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm text-ink-muted">Panel de administración</p>
        <h1 className="rl-display mt-1 text-3xl font-medium text-ink">
          RoomLynk SaaS
        </h1>
      </header>

      <div className="grid grid-cols-3 gap-px border border-border bg-border">
        {[
          { label: "Caseros registrados", value: caserosCount },
          { label: "Contratos firmados", value: contractsCount },
          { label: "Inmuebles gestionados", value: propertiesCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-paper px-6 py-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              {stat.label}
            </p>
            <p className="rl-display mt-2 text-4xl font-medium text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <Card padding="none">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Contratos recientes</h2>
        </div>
        <div className="divide-y divide-border">
          {recentContracts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              Aún no hay contratos en el sistema
            </p>
          ) : (
            recentContracts.map((c) => {
              const badge = statusBadge[c.status];
              const propertyName = getPropertyName(c.rooms);
              const roomName = getRoomName(c.rooms);

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm text-ink">
                      {propertyName}
                      {roomName && ` · ${roomName}`}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatDate(c.created_at)}
                    </p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
