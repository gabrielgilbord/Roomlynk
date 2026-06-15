import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
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
    <div className="space-y-8 sm:space-y-10">
      <PageHeader subtitle="Panel de administración" title="RoomLynk SaaS" />

      <StatGrid
        columns={3}
        stats={[
          { label: "Caseros registrados", value: caserosCount },
          { label: "Contratos firmados", value: contractsCount },
          { label: "Inmuebles gestionados", value: propertiesCount },
        ]}
      />

      <Card padding="none" className="min-w-0">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="text-sm font-semibold text-ink">Contratos recientes</h2>
        </div>
        {recentContracts.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-muted sm:px-5">
            Aún no hay contratos en el sistema
          </p>
        ) : (
          <div className="space-y-3 p-4 sm:space-y-0 sm:divide-y sm:divide-border sm:p-0">
            {recentContracts.map((c) => {
              const badge = statusBadge[c.status];
              const propertyName = getPropertyName(c.rooms);
              const roomName = getRoomName(c.rooms);

              return (
                <ListRow
                  key={c.id}
                  asCard
                  className="md:rounded-none md:border-0 md:shadow-none"
                  actions={<Badge variant={badge.variant}>{badge.label}</Badge>}
                >
                  <p className="text-sm text-ink">
                    {propertyName}
                    {roomName && ` · ${roomName}`}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">{formatDate(c.created_at)}</p>
                </ListRow>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
