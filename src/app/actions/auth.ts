"use server";

import { createClient } from "@/lib/supabase/server";
import { dashboardPathForRole } from "@/lib/auth";
import type { UserRole } from "@/types/database";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .single();

  if (next && next.startsWith("/dashboard")) {
    redirect(next);
  }

  const role = (profile?.role as UserRole) ?? "casero";
  redirect(dashboardPathForRole(role));
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const role = String(formData.get("role") ?? "casero") as UserRole;

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.session) {
    return {
      success: "Revisa tu email para confirmar la cuenta antes de entrar.",
    };
  }

  const next = String(formData.get("next") ?? "");
  if (next && next.startsWith("/")) {
    redirect(next);
  }

  redirect(dashboardPathForRole(role));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
