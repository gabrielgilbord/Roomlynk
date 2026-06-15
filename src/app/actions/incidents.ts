"use server";

import { requireProfile, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { IncidentPriority } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function createIncidentAction(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const propertyId = String(formData.get("propertyId") ?? "");
  const roomId = String(formData.get("roomId") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = String(formData.get("priority") ?? "media") as IncidentPriority;

  if (!propertyId || !title || !description) {
    return { error: "Título y descripción son obligatorios." };
  }

  const { error } = await supabase.from("incidents").insert({
    property_id: propertyId,
    room_id: roomId,
    reported_by: profile.id,
    title,
    description,
    priority,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/inquilino/averias");
  revalidatePath("/dashboard/casero/incidencias");
  return { success: true };
}

export async function updateIncidentStatusAction(
  incidentId: string,
  status: "en_progreso" | "resuelta" | "cerrada",
  assignedTo?: string
) {
  await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const updates: Record<string, unknown> = { status };
  if (assignedTo) updates.assigned_to = assignedTo;
  if (status === "resuelta" || status === "cerrada") {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("incidents")
    .update(updates)
    .eq("id", incidentId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/casero/incidencias");
  return { success: true };
}
