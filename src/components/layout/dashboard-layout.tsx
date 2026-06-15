"use client";

import { signOutAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/types/database";
import {
  Building2,
  FileSignature,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Shield,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<UserRole, NavItem[]> = {
  superadmin: [
    { label: "Resumen", href: "/dashboard/superadmin", icon: LayoutDashboard },
    { label: "Caseros", href: "/dashboard/superadmin/caseros", icon: Users },
    { label: "Contratos", href: "/dashboard/superadmin", icon: FileSignature },
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

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile: Profile;
  activePath: string;
}

function NavLink({
  item,
  active,
  onClick,
  compact,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center transition-colors",
        compact
          ? "min-w-0 flex-1 flex-col gap-1 px-1 py-2 text-center"
          : "gap-2.5 rounded-sm px-3 py-2.5 text-sm",
        active
          ? compact
            ? "text-rust"
            : "bg-linen font-medium text-ink"
          : compact
            ? "text-ink-muted"
            : "text-ink-muted hover:bg-linen hover:text-ink"
      )}
    >
      <item.icon
        className={cn("shrink-0", compact ? "mx-auto h-5 w-5" : "h-4 w-4")}
        strokeWidth={active ? 2 : 1.5}
      />
      <span className={cn(compact && "truncate text-[10px] font-medium leading-tight")}>
        {item.label}
      </span>
    </Link>
  );
}

export function DashboardLayout({ children, profile, activePath }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = navByRole[profile.role];
  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen min-w-0 bg-linen">
      {/* Sidebar — solo escritorio */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-paper lg:flex">
        <div className="border-b border-border px-5 py-5">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} active={activePath === item.href} />
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-forest text-xs font-semibold text-paper">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {profile.full_name ?? profile.email}
              </p>
              <p className="text-[11px] text-ink-muted">{roleLabels[profile.role]}</p>
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

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabecera móvil */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-paper/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-ink-muted"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Drawer móvil */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="absolute right-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-paper shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {profile.full_name ?? profile.email}
                  </p>
                  <p className="text-xs text-ink-muted">{roleLabels[profile.role]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-sm text-ink-muted"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={activePath === item.href}
                    onClick={() => setMenuOpen(false)}
                  />
                ))}
              </nav>
              <div className="border-t border-border p-4">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-sm border border-border px-3 py-2.5 text-sm text-ink-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-x-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            {children}
          </div>
        </main>

        {/* Navegación inferior — móvil */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-paper/95 backdrop-blur-sm lg:hidden pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-stretch justify-around">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={activePath === item.href}
                compact
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
