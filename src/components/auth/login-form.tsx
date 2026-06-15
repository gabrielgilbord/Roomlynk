"use client";

import { loginFormAction } from "@/app/actions/auth-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await loginFormAction(_prev, formData)) ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        required
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />

      {state?.error && (
        <p className="rounded-sm border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        ¿Primera vez?{" "}
        <Link href="/register" className="font-medium text-rust hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
