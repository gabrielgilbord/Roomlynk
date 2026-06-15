import { markExpensePaidAction } from "@/app/actions/expenses";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function FacturasInquilinoPage() {
  const profile = await requireRole(["inquilino", "superadmin"]);
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("tenant_id", profile.id)
    .maybeSingle();

  const { data: expenses } = room
    ? await supabase
        .from("expenses")
        .select("*")
        .eq("room_id", room.id)
        .order("due_date", { ascending: false })
    : { data: [] };

  return (
    <DashboardShell profile={profile} activePath="/dashboard/inquilino/facturas">
      <div className="space-y-8">
        <PageHeader
          backHref="/dashboard/inquilino"
          backLabel="← Inicio"
          title="Mis facturas"
        />

        {(expenses ?? []).length === 0 ? (
          <Card>
            <p className="py-12 text-center text-sm text-ink-muted">Sin facturas asignadas</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses?.map((exp) => (
              <Card key={exp.id} padding="sm" className="min-w-0">
                <ListRow
                  actions={
                    <div className="w-full sm:w-auto sm:text-right">
                      <p className="font-medium">
                        {formatCurrency(Number(exp.amount_per_room ?? exp.total_amount))}
                      </p>
                      {exp.status === "pendiente" ? (
                        <form
                          action={async () => {
                            "use server";
                            await markExpensePaidAction(exp.id);
                          }}
                          className="mt-2"
                        >
                          <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
                            Marcar pagado
                          </Button>
                        </form>
                      ) : (
                        <Badge variant="forest" className="mt-2">
                          pagado
                        </Badge>
                      )}
                    </div>
                  }
                >
                  <p className="text-sm font-medium capitalize text-ink">{exp.type}</p>
                  <p className="text-xs text-ink-muted">{exp.description}</p>
                  <p className="text-xs text-ink-muted">Vence {formatDate(exp.due_date)}</p>
                </ListRow>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
