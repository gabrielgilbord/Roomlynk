"use server";

import { loginAction, registerAction } from "@/app/actions/auth";

export async function loginFormAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  return (await loginAction(formData)) ?? null;
}

export async function registerFormAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData
) {
  return (await registerAction(formData)) ?? null;
}
