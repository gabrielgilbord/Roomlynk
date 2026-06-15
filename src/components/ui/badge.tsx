import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "rust" | "forest" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-linen text-ink border-border",
  rust: "bg-rust/10 text-rust border-rust/25",
  forest: "bg-forest-light text-forest border-forest/20",
  muted: "bg-transparent text-ink-muted border-border",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
