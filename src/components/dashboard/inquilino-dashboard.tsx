import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Contract, Expense, Profile, Property, Room } from "@/types/database";
import { FileSignature, Receipt, Wrench } from "lucide-react";
import Link from "next/link";

type RoomWithProperty = Room & {
  properties: Pick<Property, "name" | "address" | "city"> | null;
};

interface InquilinoDashboardProps {
  profile: Profile;
  room: RoomWithProperty | null;
  contract: Contract | null;
  expenses: Expense[];
}

export function InquilinoDashboard({
  profile,
  room,
  contract,
  expenses,
}: InquilinoDashboardProps) {
  const firstName = profile.full_name?.split(" ")[0] ?? "Inquilino";
  const property = room?.properties;
  const pendingExpenses = expenses.filter((e) => e.status === "pendiente");

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        subtitle={`Hola, ${firstName}`}
        title={
          property ? `${room?.name} · ${property.name}` : "Tu espacio"
        }
      />
      {property && (
        <p className="-mt-6 text-sm text-ink-muted sm:-mt-8">
          {property.address}, {property.city}
        </p>
      )}

      {!room && (
        <Card className="border-rust/30 bg-rust/5">
          <p className="text-sm text-ink">
            Aún no tienes una habitación asignada. Si recibiste una invitación,
            úsala para firmar tu contrato y activar tu acceso.
          </p>
        </Card>
      )}

      {contract && (
        <Card className="border-l-2 border-l-forest">
          <ListRow
            actions={
              <Link href="/dashboard/inquilino/contrato">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Ver contrato
                </Button>
              </Link>
            }
          >
            <div className="flex gap-3">
              <FileSignature className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Contrato activo</p>
                <p className="text-xs text-ink-muted">
                  Firmado · Vigente hasta{" "}
                  {contract.end_date ? formatDate(contract.end_date) : "—"}
                </p>
              </div>
            </div>
          </ListRow>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card padding="none" className="min-w-0">
          <div className="border-b border-border px-4 py-4 sm:px-5">
            <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              <Receipt className="h-4 w-4 shrink-0" />
              Facturas
              {pendingExpenses.length > 0 && (
                <Badge variant="rust">{pendingExpenses.length} pendientes</Badge>
              )}
            </h2>
          </div>
          {expenses.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-muted sm:px-5">
              Sin facturas asignadas
            </p>
          ) : (
            <div className="space-y-3 p-4 sm:space-y-0 sm:divide-y sm:divide-border sm:p-0">
              {expenses.map((exp) => (
                <ListRow
                  key={exp.id}
                  asCard
                  className="md:rounded-none md:border-0 md:shadow-none"
                  actions={
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium text-ink">
                        {formatCurrency(Number(exp.amount_per_room ?? exp.total_amount))}
                      </p>
                      <Badge
                        variant={exp.status === "pagado" ? "forest" : "rust"}
                        className="mt-1"
                      >
                        {exp.status}
                      </Badge>
                    </div>
                  }
                >
                  <p className="text-sm capitalize text-ink">{exp.type}</p>
                  <p className="text-xs text-ink-muted">Vence {formatDate(exp.due_date)}</p>
                </ListRow>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex flex-col items-center py-6 text-center">
            <Wrench className="h-8 w-8 text-ink-muted/50" />
            <p className="mt-4 text-sm font-medium text-ink">Reportar avería</p>
            <p className="mt-1 text-xs text-ink-muted">
              Describe el problema y el casero asignará un operario.
            </p>
            <Link href="/dashboard/inquilino/averias">
              <Button variant="outline" size="sm" className="mt-5">
                Nueva incidencia
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
