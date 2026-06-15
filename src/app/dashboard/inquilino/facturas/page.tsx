import { markExpensePaidAction } from "@/app/actions/expenses";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

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
        <header>
          <Link href="/dashboard/inquilino" className="text-xs text-ink-muted hover:text-ink">
            ← Inicio
          </Link>
          <h1 className="rl-display mt-2 text-3xl font-medium text-ink">Mis facturas</h1>
        </header>

        <Card padding="none">
          <div className="divide-y divide-border">
            {(expenses ?? []).length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-ink-muted">Sin facturas asignadas</p>
            ) : (
              expenses?.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink capitalize">{exp.type}</p>
                    <p className="text-xs text-ink-muted">{exp.description}</p>
                    <p className="text-xs text-ink-muted">Vence {formatDate(exp.due_date)}</p>
                  </div>
                  <div className="text-right">
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
                        <Button type="submit" size="sm" variant="outline">
                          Marcar pagado
                        </Button>
                      </form>
                    ) : (
                      <Badge variant="forest" className="mt-2">pagado</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
