"use client";

import { registerFormAction } from "@/app/actions/auth-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";

export function RegisterFormWithNext() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  return <RegisterForm defaultNext={next} />;
}

export function RegisterForm({ defaultNext = "" }: { defaultNext?: string }) {
  const [role, setRole] = useState<UserRole>("casero");
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return (await registerFormAction(_prev, formData)) ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="role" value={role} />
      {defaultNext && <input type="hidden" name="next" value={defaultNext} />}

      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { id: "casero" as const, label: "Soy casero", desc: "Gestiono inmuebles" },
            { id: "inquilino" as const, label: "Soy inquilino", desc: "Alquilo habitación" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setRole(option.id)}
            className={cn(
              "rounded-sm border p-3 text-left transition-colors",
              role === option.id
                ? "border-rust bg-rust/5"
                : "border-border bg-paper hover:border-border-strong"
            )}
          >
            <p className="text-sm font-medium text-ink">{option.label}</p>
            <p className="text-xs text-ink-muted">{option.desc}</p>
          </button>
        ))}
      </div>

      <Input
        label="Nombre completo"
        name="fullName"
        placeholder="María García"
        required
      />
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
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        hint="Usa al menos 8 caracteres"
        required
      />

      {state?.error && (
        <p className="rounded-sm border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-sm border border-forest/30 bg-forest-light px-3 py-2 text-sm text-forest">
          {state.success}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-rust hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
