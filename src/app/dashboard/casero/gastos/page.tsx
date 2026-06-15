import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function GastosCaseroPage() {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const [{ data: properties }, { data: expenses }] = await Promise.all([
    supabase.from("properties").select("*, rooms(*)").order("name"),
    supabase
      .from("expenses")
      .select("*, rooms(name), properties(name)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <DashboardShell profile={profile} activePath="/dashboard/casero/gastos">
      <div className="space-y-8">
        <PageHeader
          backHref="/dashboard/casero"
          backLabel="← Resumen"
          title="Gastos y facturas"
        />

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Card className="min-w-0">
            <h2 className="mb-6 text-sm font-semibold text-ink">Registrar gasto</h2>
            <ExpenseForm properties={properties ?? []} />
          </Card>

          <Card padding="none" className="min-w-0">
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-ink">Historial</h2>
            </div>
            {(expenses ?? []).length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-muted sm:px-5">Sin gastos</p>
            ) : (
              <div className="max-h-none space-y-3 p-4 sm:max-h-[480px] sm:space-y-0 sm:overflow-y-auto sm:p-0 sm:divide-y sm:divide-border">
                {expenses?.map((exp) => (
                  <ListRow
                    key={exp.id}
                    asCard
                    className="sm:rounded-none sm:border-0 sm:shadow-none"
                    actions={
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(Number(exp.amount_per_room ?? exp.total_amount))}
                        </p>
                        <Badge variant={exp.status === "pagado" ? "forest" : "rust"} className="mt-1">
                          {exp.status}
                        </Badge>
                      </div>
                    }
                  >
                    <p className="text-sm capitalize text-ink">
                      {exp.type} — {exp.description}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {(exp.rooms as { name: string } | null)?.name ?? "Común"} · Vence{" "}
                      {formatDate(exp.due_date)}
                    </p>
                  </ListRow>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
