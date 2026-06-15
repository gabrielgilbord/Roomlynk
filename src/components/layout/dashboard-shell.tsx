import { signOutAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/types/database";
import {
  Building2,
  FileSignature,
  Home,
  LayoutDashboard,
  Receipt,
  Shield,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<UserRole, NavItem[]> = {
  superadmin: [
    { label: "Resumen", href: "/dashboard/superadmin", icon: LayoutDashboard },
    { label: "Caseros", href: "/dashboard/superadmin/caseros", icon: Users },
    { label: "Contratos", href: "/dashboard/superadmin/contratos", icon: FileSignature },
    { label: "Plantillas", href: "/dashboard/superadmin/plantillas", icon: Shield },
  ],
  casero: [
    { label: "Resumen", href: "/dashboard/casero", icon: LayoutDashboard },
    { label: "Inmuebles", href: "/dashboard/casero/propiedades", icon: Building2 },
    { label: "Contratos", href: "/dashboard/casero/contratos", icon: FileSignature },
    { label: "Gastos", href: "/dashboard/casero/gastos", icon: Receipt },
    { label: "Incidencias", href: "/dashboard/casero/incidencias", icon: Wrench },
  ],
  inquilino: [
    { label: "Inicio", href: "/dashboard/inquilino", icon: Home },
    { label: "Contrato", href: "/dashboard/inquilino/contrato", icon: FileSignature },
    { label: "Facturas", href: "/dashboard/inquilino/facturas", icon: Receipt },
    { label: "Averías", href: "/dashboard/inquilino/averias", icon: Wrench },
  ],
};

const roleLabels: Record<UserRole, string> = {
  superadmin: "Administración",
  casero: "Casero",
  inquilino: "Inquilino",
};

interface DashboardShellProps {
  children: React.ReactNode;
  profile: Profile;
  activePath: string;
}

export function DashboardShell({
  children,
  profile,
  activePath,
}: DashboardShellProps) {
  const navItems = navByRole[profile.role];
  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-linen">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-paper">
        <div className="border-b border-border px-5 py-5">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const active = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-linen font-medium text-ink"
                    : "text-ink-muted hover:bg-linen hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-forest text-xs font-semibold text-paper">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {profile.full_name ?? profile.email}
              </p>
              <p className="text-[11px] text-ink-muted">
                {roleLabels[profile.role]}
              </p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-sm border border-border px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
