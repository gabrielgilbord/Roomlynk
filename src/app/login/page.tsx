import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo — identidad */}
      <aside className="hidden w-[45%] flex-col justify-between border-r border-border bg-forest p-12 text-paper lg:flex">
        <Logo className="[&_span]:text-paper [&_span:last-child]:text-[#e8c4b8]" />
        <div>
          <p className="rl-display text-4xl font-medium leading-tight">
            Tu piso,
            <br />
            <em className="text-[#e8c4b8]">bien atado.</em>
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/70">
            Contratos firmados, gastos repartidos y averías resueltas.
            Sin Excel, sin WhatsApp perdido, sin sorpresas legales.
          </p>
        </div>
        <p className="text-xs text-paper/40">RoomLynk · Gestión de coliving</p>
      </aside>

      {/* Formulario */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <Card className="w-full max-w-md" padding="lg">
          <div className="mb-8">
            <h1 className="rl-display text-2xl font-semibold text-ink">
              Entrar
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Accede a tu panel de casero o inquilino.
            </p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </Card>
        <Link
          href="/"
          className="mt-8 text-sm text-ink-muted hover:text-ink"
        >
          ← Volver al inicio
        </Link>
      </main>
    </div>
  );
}
