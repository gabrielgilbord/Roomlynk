import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Contract, Expense, Profile, Property, Room } from "@/types/database";
import { FileSignature, Receipt, Wrench } from "lucide-react";

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
    <div className="space-y-10">
      <header>
        <p className="text-sm text-ink-muted">Hola, {firstName}</p>
        <h1 className="rl-display mt-1 text-3xl font-medium text-ink">
          {property ? (
            <>
              {room?.name} · {property.name}
            </>
          ) : (
            "Tu espacio"
          )}
        </h1>
        {property && (
          <p className="mt-1 text-sm text-ink-muted">
            {property.address}, {property.city}
          </p>
        )}
      </header>

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
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <FileSignature className="mt-0.5 h-5 w-5 text-forest" />
              <div>
                <p className="text-sm font-medium text-ink">Contrato activo</p>
                <p className="text-xs text-ink-muted">
                  Firmado · Vigente hasta{" "}
                  {contract.end_date ? formatDate(contract.end_date) : "—"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Ver contrato
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card padding="none">
          <div className="border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Receipt className="h-4 w-4" />
              Facturas
              {pendingExpenses.length > 0 && (
                <Badge variant="rust" className="ml-auto">
                  {pendingExpenses.length} pendientes
                </Badge>
              )}
            </h2>
          </div>
          <div className="divide-y divide-border">
            {expenses.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-muted">
                Sin facturas asignadas
              </p>
            ) : (
              expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm text-ink capitalize">{exp.type}</p>
                    <p className="text-xs text-ink-muted">
                      Vence {formatDate(exp.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
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
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col items-center py-6 text-center">
            <Wrench className="h-8 w-8 text-ink-muted/50" />
            <p className="mt-4 text-sm font-medium text-ink">Reportar avería</p>
            <p className="mt-1 text-xs text-ink-muted">
              Describe el problema y el casero asignará un operario.
            </p>
            <Button variant="outline" size="sm" className="mt-5">
              Nueva incidencia
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
