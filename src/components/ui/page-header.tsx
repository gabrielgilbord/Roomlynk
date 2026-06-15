import { cn } from "@/lib/utils";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "← Volver",
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-4", className)}>
      {backHref && (
        <Link href={backHref} className="inline-block text-xs text-ink-muted hover:text-ink">
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
          <h1 className="rl-display mt-1 text-2xl font-medium text-ink sm:text-3xl">{title}</h1>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
