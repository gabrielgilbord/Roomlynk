import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <Link href="/" className={cn("group inline-flex items-baseline gap-0.5", className)}>
      <span
        className={cn(
          "rl-display font-bold tracking-tight text-ink",
          sizes[size]
        )}
      >
        Room
      </span>
      <span
        className={cn(
          "rl-display font-bold tracking-tight text-rust",
          sizes[size]
        )}
      >
        Lynk
      </span>
    </Link>
  );
}
