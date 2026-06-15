import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InvitationForm } from "@/components/invitations/invitation-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      <div className="space-y-10">
        <header>
          <Link href="/dashboard/casero" className="text-xs text-ink-muted hover:text-ink">
            ← Resumen
          </Link>
          <h1 className="rl-display mt-2 text-3xl font-medium text-ink">Contratos e invitaciones</h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <h2 className="mb-6 text-sm font-semibold text-ink">Nueva invitación</h2>
            <InvitationForm rooms={ownedRooms as Parameters<typeof InvitationForm>[0]["rooms"]} />
          </Card>

          <Card padding="none">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Invitaciones recientes</h2>
            </div>
            <div className="divide-y divide-border">
              {(invitations ?? []).length === 0 ? (
                <p className="px-5 py-8 text-sm text-ink-muted text-center">Sin invitaciones</p>
              ) : (
                invitations?.map((inv) => (
                  <div key={inv.id} className="px-5 py-3">
                    <p className="text-sm text-ink">{inv.email}</p>
                    <p className="text-xs text-ink-muted">
                      {relName(inv.rooms)} ·{" "}
                      {inv.used_at ? "Usada" : `Expira ${formatDate(inv.expires_at)}`}
                    </p>
                    {!inv.used_at && (
                      <Link
                        href={`/invitation/${inv.token}`}
                        className="text-xs text-rust hover:underline"
                      >
                        Abrir enlace
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card padding="none">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Todos los contratos</h2>
          </div>
          <div className="divide-y divide-border">
            {(contracts ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-ink-muted text-center">Sin contratos</p>
            ) : (
              contracts?.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm text-ink">{contractLabel(c.rooms)}</p>
                  <Badge variant={c.status === "firmado" ? "forest" : "rust"}>{c.status}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
