import { Logo } from "@/components/brand/logo";
import { RegisterFormWithNext } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <aside className="hidden w-[45%] flex-col justify-between border-r border-border bg-paper p-12 lg:flex">
        <Logo />
        <div className="space-y-8">
          <div className="border-l-2 border-rust pl-5">
            <p className="text-sm font-medium text-ink">Para caseros</p>
            <p className="mt-1 text-sm text-ink-muted">
              Registra habitaciones, envía invitaciones y reparte la luz entre
              inquilinos automáticamente.
            </p>
          </div>
          <div className="border-l-2 border-forest pl-5">
            <p className="text-sm font-medium text-ink">Para inquilinos</p>
            <p className="mt-1 text-sm text-ink-muted">
              Firma tu contrato online, consulta facturas y reporta averías
              desde un solo sitio.
            </p>
          </div>
        </div>
        <p className="text-xs text-ink-muted">Sin tarjeta · Empieza en 2 minutos</p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <Card className="w-full max-w-md" padding="lg">
          <div className="mb-8">
            <h1 className="rl-display text-2xl font-semibold text-ink">
              Crear cuenta
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Elige tu rol y empieza a usar RoomLynk.
            </p>
          </div>
          <Suspense>
            <RegisterFormWithNext />
          </Suspense>
        </Card>
        <Link href="/" className="mt-8 text-sm text-ink-muted hover:text-ink">
          ← Volver al inicio
        </Link>
      </main>
    </div>
  );
}
