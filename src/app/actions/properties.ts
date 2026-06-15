"use server";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPropertyAction(formData: FormData) {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const totalRooms = Number(formData.get("totalRooms") ?? 1);
  const roomName = String(formData.get("roomName") ?? "Habitación 1").trim();
  const monthlyRent = Number(formData.get("monthlyRent") ?? 0);

  if (!name || !address || !city) {
    return { error: "Nombre, dirección y ciudad son obligatorios." };
  }

  const { data: property, error: propError } = await supabase
    .from("properties")
    .insert({
      owner_id: profile.id,
      name,
      address,
      city,
      postal_code: postalCode || null,
      total_rooms: totalRooms,
    })
    .select("id")
    .single();

  if (propError || !property) {
    return { error: propError?.message ?? "No se pudo crear el inmueble." };
  }

  const { error: roomError } = await supabase.from("rooms").insert({
    property_id: property.id,
    name: roomName,
    monthly_rent: monthlyRent,
    deposit: monthlyRent,
  });

  if (roomError) {
    return { error: roomError.message };
  }

  revalidatePath("/dashboard/casero");
  revalidatePath("/dashboard/casero/propiedades");
  redirect("/dashboard/casero/propiedades");
}
