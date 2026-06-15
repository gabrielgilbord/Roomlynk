"use server";

import { requireProfile } from "@/lib/auth";
import { buildPlaceholders, generateDocumentHash, injectPlaceholders } from "@/lib/contracts";
import { createClient } from "@/lib/supabase/server";
import type { TenantData } from "@/types/contracts";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function signContractAction(payload: {
  contractId: string;
  invitationToken: string;
  tenantData: TenantData;
  signatureData: string;
  templateHtml: string;
  meta: {
    caseroName: string;
    caseroDni: string;
    roomName: string;
    propertyAddress: string;
    propertyCity: string;
    startDate: string;
    endDate: string;
    rent: number;
    deposit: number;
  };
}) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const headersList = await headers();

  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "127.0.0.1";

  const placeholders = buildPlaceholders(
    payload.tenantData,
    { name: payload.meta.caseroName, dni: payload.meta.caseroDni },
    {
      address: payload.meta.propertyAddress,
      city: payload.meta.propertyCity,
      roomName: payload.meta.roomName,
    },
    {
      startDate: payload.meta.startDate,
      endDate: payload.meta.endDate,
      rent: payload.meta.rent,
      deposit: payload.meta.deposit,
    }
  );

  const renderedHtml = injectPlaceholders(payload.templateHtml, placeholders);
  const documentHash = await generateDocumentHash(renderedHtml + payload.signatureData);

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, room_id, contract_id")
    .eq("token", payload.invitationToken)
    .is("used_at", null)
    .single();

  if (!invitation || invitation.contract_id !== payload.contractId) {
    return { error: "Invitación inválida o expirada." };
  }

  const { error: contractError } = await supabase
    .from("contracts")
    .update({
      inquilino_id: profile.id,
      tenant_full_name: payload.tenantData.fullName,
      tenant_dni_nie: payload.tenantData.dniNie,
      tenant_phone: payload.tenantData.phone,
      tenant_bank_account: payload.tenantData.bankAccount,
      rendered_html: renderedHtml,
      status: "pendiente_inquilino",
    })
    .eq("id", payload.contractId);

  if (contractError) return { error: contractError.message };

  const { error: sigError } = await supabase.from("legal_signatures").insert({
    contract_id: payload.contractId,
    signer_id: profile.id,
    signer_role: profile.role,
    signature_data: payload.signatureData,
    ip_address: ip,
    user_agent: headersList.get("user-agent") ?? "",
    document_hash: documentHash,
  });

  if (sigError) return { error: sigError.message };

  await supabase
    .from("invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invitation.id);

  await supabase
    .from("rooms")
    .update({ tenant_id: profile.id, is_occupied: true })
    .eq("id", invitation.room_id);

  await supabase
    .from("profiles")
    .update({
      full_name: payload.tenantData.fullName,
      dni_nie: payload.tenantData.dniNie,
      phone: payload.tenantData.phone,
      bank_account: payload.tenantData.bankAccount,
    })
    .eq("id", profile.id);

  revalidatePath("/dashboard/inquilino");
  return { success: true, documentHash };
}
