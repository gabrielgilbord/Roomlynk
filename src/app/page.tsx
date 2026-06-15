import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linen">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo size="lg" />
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Empezar gratis</Button>
          </Link>
        </div>
      </header>

      {/* Hero editorial */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-rust">
              Gestión de coliving
            </p>
            <h1 className="rl-display text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.05] tracking-tight text-ink">
              El piso compartido,
              <br />
              <em className="text-rust">sin el caos.</em>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-muted">
              Contratos que se firman solos, gastos que se reparten solos,
              averías que no se pierden en un grupo de WhatsApp.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">Crear cuenta de casero</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>

          {/* Panel visual — no es un bento genérico */}
          <div className="relative">
            <div className="border border-border bg-paper p-6 shadow-[4px_4px_0_var(--border-strong)]">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Piso Gran Vía · 4 hab.
                </span>
                <span className="rounded-sm bg-forest-light px-2 py-0.5 text-[11px] font-medium text-forest">
                  3/4 ocupadas
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Contrato Hab. 2", status: "Firmado", ok: true },
                  { label: "Factura luz Jun", status: "47 €/hab.", ok: false },
                  { label: "Fuga baño", status: "En curso", ok: false },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink">{row.label}</span>
                    <span
                      className={
                        row.ok ? "text-forest font-medium" : "text-ink-muted"
                      }
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full border border-rust/20 bg-rust/5" />
          </div>
        </div>
      </section>

      {/* Tres roles — layout asimétrico */}
      <section className="border-t border-border bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="rl-display mb-12 text-3xl font-medium text-ink">
            Tres paneles, un solo sistema
          </h2>
          <div className="grid gap-px border border-border bg-border md:grid-cols-3">
            {[
              {
                title: "Casero",
                desc: "Registra inmuebles, genera invitaciones con contrato y reparte gastos entre habitaciones activas.",
                accent: "border-rust",
              },
              {
                title: "Inquilino",
                desc: "Firma online, consulta facturas de suministros y reporta averías con contacto del operario.",
                accent: "border-forest",
              },
              {
                title: "Superadmin",
                desc: "Métricas del SaaS, auditoría de contratos firmados y plantillas legales RGPD.",
                accent: "border-ink-muted",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`border-t-2 ${item.accent} bg-paper p-8`}
              >
                <h3 className="rl-display text-xl font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-ink-muted">
        RoomLynk · Hecho para caseros que valoran su tiempo
      </footer>
    </div>
  );
}
