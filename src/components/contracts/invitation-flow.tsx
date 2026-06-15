"use client";

import { signContractAction } from "@/app/actions/contracts";
import { ContractPreview } from "@/components/contracts/contract-preview";
import { ContractStepper } from "@/components/contracts/contract-stepper";
import { SignaturePad } from "@/components/contracts/signature-pad";
import { TenantDataForm } from "@/components/contracts/tenant-data-form";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildPlaceholders, injectPlaceholders } from "@/lib/contracts";
import type { InvitationPublicData } from "@/lib/invitations";
import type { ContractStep, TenantData } from "@/types/contracts";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface InvitationFlowProps {
  data: InvitationPublicData;
  profileEmail: string;
}

export function InvitationFlow({ data, profileEmail }: InvitationFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<ContractStep>("datos");
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [renderedHtml, setRenderedHtml] = useState("");
  const [documentHash, setDocumentHash] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTenantSubmit = useCallback(
    (formData: TenantData) => {
      setTenantData(formData);
      const placeholders = buildPlaceholders(
        formData,
        { name: data.casero_name, dni: data.casero_dni },
        {
          address: data.property_address,
          city: data.property_city,
          roomName: data.room_name,
        },
        {
          startDate: data.start_date,
          endDate: data.end_date,
          rent: Number(data.monthly_rent),
          deposit: Number(data.deposit),
        }
      );
      setRenderedHtml(injectPlaceholders(data.template_html, placeholders));
      setStep("revision");
    },
    [data]
  );

  const handleSign = useCallback(
    async (signatureData: string) => {
      if (!tenantData) return;
      setIsSubmitting(true);
      setError("");

      const result = await signContractAction({
        contractId: data.contract_id,
        invitationToken: data.token,
        tenantData,
        signatureData,
        templateHtml: data.template_html,
        meta: {
          caseroName: data.casero_name,
          caseroDni: data.casero_dni,
          roomName: data.room_name,
          propertyAddress: data.property_address,
          propertyCity: data.property_city,
          startDate: data.start_date,
          endDate: data.end_date,
          rent: Number(data.monthly_rent),
          deposit: Number(data.deposit),
        },
      });

      setIsSubmitting(false);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setDocumentHash(result.documentHash ?? "");
      setStep("confirmacion");
    },
    [tenantData, data]
  );

  return (
    <div className="min-h-screen bg-linen">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-10 text-center">
          <Logo className="justify-center" />
          <h1 className="rl-display mt-8 text-2xl font-medium text-ink">
            Firma tu contrato
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {data.room_name} · {data.property_address}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Sesión: {profileEmail}
            {data.email && data.email !== profileEmail && (
              <span className="text-rust"> · Email invitación: {data.email}</span>
            )}
          </p>
        </div>

        <div className="mb-8">
          <ContractStepper currentStep={step} />
        </div>

        {error && (
          <p className="mb-4 rounded-sm border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
            {error}
          </p>
        )}

        <Card padding="lg">
          {step === "datos" && <TenantDataForm onSubmit={handleTenantSubmit} />}

          {step === "revision" && renderedHtml && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-ink">Revisa el contrato</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Renta: {Number(data.monthly_rent).toFixed(2)} € · Fianza:{" "}
                  {Number(data.deposit).toFixed(2)} €
                </p>
              </div>
              <ContractPreview renderedHtml={renderedHtml} />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("datos")} className="flex-1">
                  Editar datos
                </Button>
                <Button onClick={() => setStep("firma")} className="flex-1">
                  Firmar
                </Button>
              </div>
            </div>
          )}

          {step === "firma" && (
            <div className="space-y-6">
              <SignaturePad onSave={handleSign} disabled={isSubmitting} />
              <Button variant="ghost" onClick={() => setStep("revision")} className="w-full">
                Volver al contrato
              </Button>
            </div>
          )}

          {step === "confirmacion" && (
            <div className="space-y-6 py-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-forest" />
              <div>
                <h2 className="rl-display text-xl font-medium text-ink">
                  Contrato firmado
                </h2>
                <p className="mt-2 text-sm text-ink-muted">
                  Documento inmutable registrado correctamente.
                </p>
              </div>
              {documentHash && (
                <div className="rounded-sm border border-border bg-linen p-4 text-left text-xs text-ink-muted">
                  Hash: <code className="text-forest">{documentHash.slice(0, 24)}…</code>
                </div>
              )}
              <Button className="w-full" onClick={() => router.push("/dashboard/inquilino")}>
                Ir a mi panel
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
