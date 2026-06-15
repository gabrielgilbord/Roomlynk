import { cn } from "@/lib/utils";

interface ListRowProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  asCard?: boolean;
}

/** Fila de lista que se apila en móvil y alinea en fila en pantallas medianas+ */
export function ListRow({ children, actions, className, asCard = false }: ListRowProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        asCard && "rounded-sm border border-border bg-paper p-4 shadow-[0_1px_0_rgba(26,22,20,0.04)]",
        !asCard && "px-4 py-4 sm:px-5",
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}

interface ListStackProps {
  children: React.ReactNode;
  className?: string;
  /** En móvil: tarjetas separadas. En md+: lista unificada dentro de un Card */
  variant?: "cards" | "divided";
}

export function ListStack({ children, className, variant = "cards" }: ListStackProps) {
  if (variant === "divided") {
    return <div className={cn("divide-y divide-border", className)}>{children}</div>;
  }

  return <div className={cn("space-y-3 md:space-y-0 md:divide-y md:divide-border md:rounded-sm md:border md:border-border md:bg-paper", className)}>{children}</div>;
}
