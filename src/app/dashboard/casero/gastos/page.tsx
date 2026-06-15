import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

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
      <div className="space-y-10">
        <header>
          <Link href="/dashboard/casero" className="text-xs text-ink-muted hover:text-ink">
            ← Resumen
          </Link>
          <h1 className="rl-display mt-2 text-3xl font-medium text-ink">Gastos y facturas</h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <h2 className="mb-6 text-sm font-semibold text-ink">Registrar gasto</h2>
            <ExpenseForm properties={properties ?? []} />
          </Card>

          <Card padding="none">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Historial</h2>
            </div>
            <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
              {(expenses ?? []).length === 0 ? (
                <p className="px-5 py-8 text-sm text-ink-muted text-center">Sin gastos</p>
              ) : (
                expenses?.map((exp) => (
                  <div key={exp.id} className="flex justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-ink capitalize">{exp.type} — {exp.description}</p>
                      <p className="text-xs text-ink-muted">
                        {(exp.rooms as { name: string } | null)?.name ?? "Común"} · Vence{" "}
                        {formatDate(exp.due_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(Number(exp.amount_per_room ?? exp.total_amount))}
                      </p>
                      <Badge variant={exp.status === "pagado" ? "forest" : "rust"} className="mt-1">
                        {exp.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
