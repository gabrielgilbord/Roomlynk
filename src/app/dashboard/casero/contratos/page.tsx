import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InvitationForm } from "@/components/invitations/invitation-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

function relName(rel: unknown): string {
  if (!rel || typeof rel !== "object") return "—";
  const row = Array.isArray(rel) ? rel[0] : rel;
  return (row as { name?: string })?.name ?? "—";
}

function contractLabel(rooms: unknown): string {
  const room = Array.isArray(rooms) ? rooms[0] : rooms;
  if (!room || typeof room !== "object") return "—";
  const r = room as { name?: string; properties?: unknown };
  return `${relName(r.properties)} · ${r.name ?? "—"}`;
}

export default async function ContratosCaseroPage() {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const [{ data: rooms }, { data: contracts }, { data: invitations }] = await Promise.all([
    supabase
      .from("rooms")
      .select("*, properties!inner(name, owner_id)")
      .eq("properties.owner_id", profile.id)
      .order("name"),
    supabase
      .from("contracts")
      .select("id, status, created_at, rooms(name, properties(name))")
      .eq("casero_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invitations")
      .select("id, token, email, expires_at, used_at, created_at, rooms(name)")
      .eq("created_by", profile.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const ownedRooms = rooms ?? [];

  return (
    <DashboardShell profile={profile} activePath="/dashboard/casero/contratos">
      <div className="space-y-8">
        <PageHeader
          backHref="/dashboard/casero"
          backLabel="← Resumen"
          title="Contratos e invitaciones"
        />

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Card className="min-w-0">
            <h2 className="mb-6 text-sm font-semibold text-ink">Nueva invitación</h2>
            <InvitationForm rooms={ownedRooms as Parameters<typeof InvitationForm>[0]["rooms"]} />
          </Card>

          <Card padding="none" className="min-w-0">
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-ink">Invitaciones recientes</h2>
            </div>
            {(invitations ?? []).length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-muted sm:px-5">Sin invitaciones</p>
            ) : (
              <div className="space-y-3 p-4 sm:space-y-0 sm:divide-y sm:divide-border sm:p-0">
                {invitations?.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-sm border border-border p-4 sm:border-0 sm:px-5 sm:py-3"
                  >
                    <p className="text-sm text-ink">{inv.email}</p>
                    <p className="text-xs text-ink-muted">
                      {relName(inv.rooms)} ·{" "}
                      {inv.used_at ? "Usada" : `Expira ${formatDate(inv.expires_at)}`}
                    </p>
                    {!inv.used_at && (
                      <Link
                        href={`/invitation/${inv.token}`}
                        className="mt-2 inline-block text-xs text-rust hover:underline"
                      >
                        Abrir enlace
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card padding="none" className="min-w-0">
          <div className="border-b border-border px-4 py-4 sm:px-5">
            <h2 className="text-sm font-semibold text-ink">Todos los contratos</h2>
          </div>
          {(contracts ?? []).length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-muted sm:px-5">Sin contratos</p>
          ) : (
            <div className="space-y-3 p-4 sm:space-y-0 sm:divide-y sm:divide-border sm:p-0">
              {contracts?.map((c) => (
                <ListRow
                  key={c.id}
                  asCard
                  className="sm:rounded-none sm:border-0 sm:shadow-none"
                  actions={
                    <Badge variant={c.status === "firmado" ? "forest" : "rust"}>{c.status}</Badge>
                  }
                >
                  <p className="text-sm text-ink">{contractLabel(c.rooms)}</p>
                </ListRow>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
