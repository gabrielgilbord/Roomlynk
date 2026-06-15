import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ContractPreview } from "@/components/contracts/contract-preview";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function ContratoInquilinoPage() {
  const profile = await requireRole(["inquilino", "superadmin"]);
  const supabase = await createClient();

  const { data: contract } = await supabase
    .from("contracts")
    .select("*, rooms(name, properties(name, address, city))")
    .eq("inquilino_id", profile.id)
    .eq("status", "firmado")
    .order("created_at", { ascending: false })
    .maybeSingle();

  const { data: signature } = contract
    ? await supabase
        .from("legal_signatures")
        .select("signed_at, document_hash, ip_address")
        .eq("contract_id", contract.id)
        .maybeSingle()
    : { data: null };

  return (
    <DashboardShell profile={profile} activePath="/dashboard/inquilino/contrato">
      <div className="space-y-8">
        <header>
          <Link href="/dashboard/inquilino" className="text-xs text-ink-muted hover:text-ink">
            ← Inicio
          </Link>
          <h1 className="rl-display mt-2 text-3xl font-medium text-ink">Mi contrato</h1>
        </header>

        {!contract ? (
          <Card>
            <p className="text-sm text-ink-muted">
              Aún no tienes un contrato firmado. Si recibiste una invitación, úsala para firmar.
            </p>
          </Card>
        ) : (
          <>
            <Card className="border-l-2 border-l-forest">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {(contract.rooms as { properties?: { name: string }; name: string })?.properties?.name}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {(contract.rooms as { name: string })?.name} · Vigente hasta{" "}
                    {contract.end_date ? formatDate(contract.end_date) : "—"}
                  </p>
                </div>
                <Badge variant="forest">Firmado · Inmutable</Badge>
              </div>
              {signature && (
                <div className="mt-4 border-t border-border pt-4 text-xs text-ink-muted space-y-1">
                  <p>Firmado: {formatDate(signature.signed_at)}</p>
                  <p>Hash: <code className="text-forest">{signature.document_hash.slice(0, 20)}…</code></p>
                </div>
              )}
            </Card>

            {contract.rendered_html && (
              <ContractPreview renderedHtml={contract.rendered_html} isLocked />
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
