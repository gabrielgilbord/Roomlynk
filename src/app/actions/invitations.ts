"use server";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvitationAction(formData: FormData) {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const roomId = String(formData.get("roomId") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const templateSlug = String(formData.get("templateSlug") ?? "habitacion-temporada-v1");

  if (!roomId || !email) {
    return { error: "Habitación y email son obligatorios." };
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("*, properties!inner(owner_id, name, address, city)")
    .eq("id", roomId)
    .single();

  if (!room) return { error: "Habitación no encontrada." };

  const { data: template } = await supabase
    .from("contract_templates")
    .select("id")
    .eq("slug", templateSlug)
    .single();

  if (!template) return { error: "Plantilla no encontrada." };

  const start = new Date();
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert({
      room_id: roomId,
      template_id: template.id,
      casero_id: profile.id,
      status: "pendiente_inquilino",
      monthly_rent: room.monthly_rent,
      deposit_amount: room.deposit,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (contractError || !contract) {
    return { error: contractError?.message ?? "Error al crear contrato." };
  }

  const { data: invitation, error: invError } = await supabase
    .from("invitations")
    .insert({
      room_id: roomId,
      contract_id: contract.id,
      email,
      created_by: profile.id,
    })
    .select("token")
    .single();

  if (invError || !invitation) {
    return { error: invError?.message ?? "Error al crear invitación." };
  }

  revalidatePath("/dashboard/casero");
  revalidatePath("/dashboard/casero/contratos");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    success: true,
    token: invitation.token,
    url: `${baseUrl}/invitation/${invitation.token}`,
  };
}
