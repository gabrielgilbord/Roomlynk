"use server";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseType } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function createExpenseAction(formData: FormData) {
  const profile = await requireRole(["casero", "superadmin"]);
  const supabase = await createClient();

  const propertyId = String(formData.get("propertyId") ?? "");
  const type = String(formData.get("type") ?? "luz") as ExpenseType;
  const description = String(formData.get("description") ?? "").trim();
  const totalAmount = Number(formData.get("totalAmount") ?? 0);
  const dueDate = String(formData.get("dueDate") ?? "");
  const splitCommon = formData.get("splitCommon") === "on";

  if (!propertyId || !description || totalAmount <= 0 || !dueDate) {
    return { error: "Completa todos los campos." };
  }

  const billingPeriod = new Date().toISOString().slice(0, 10);

  if (splitCommon) {
    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        property_id: propertyId,
        room_id: null,
        type,
        description,
        total_amount: totalAmount,
        billing_period: billingPeriod,
        due_date: dueDate,
        created_by: profile.id,
      })
      .select("id")
      .single();

    if (error || !expense) return { error: error?.message ?? "Error al crear gasto." };

    const { error: rpcError } = await supabase.rpc("split_common_expense", {
      p_expense_id: expense.id,
    });

    if (rpcError) return { error: rpcError.message };
  } else {
    const roomId = String(formData.get("roomId") ?? "");
    if (!roomId) return { error: "Selecciona una habitación." };

    const { error } = await supabase.from("expenses").insert({
      property_id: propertyId,
      room_id: roomId,
      type,
      description,
      total_amount: totalAmount,
      amount_per_room: totalAmount,
      billing_period: billingPeriod,
      due_date: dueDate,
      created_by: profile.id,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard/casero/gastos");
  revalidatePath("/dashboard/inquilino");
  return { success: true };
}

export async function markExpensePaidAction(expenseId: string) {
  await requireRole(["inquilino", "casero", "superadmin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("expenses")
    .update({ status: "pagado", paid_at: new Date().toISOString() })
    .eq("id", expenseId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/inquilino/facturas");
  revalidatePath("/dashboard/casero/gastos");
  return { success: true };
}
