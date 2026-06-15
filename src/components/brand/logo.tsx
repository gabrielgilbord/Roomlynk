import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showMark?: boolean;
}

const textSizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
};

const markSizes = {
  sm: 28,
  md: 32,
  lg: 40,
};

export function Logo({ className, size = "md", showMark = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      {showMark && <LogoMark size={markSizes[size]} />}
      <span className="inline-flex items-baseline gap-0.5">
        <span
          className={cn(
            "rl-display font-bold tracking-tight text-ink",
            textSizes[size]
          )}
        >
          Room
        </span>
        <span
          className={cn(
            "rl-display font-bold tracking-tight text-rust",
            textSizes[size]
          )}
        >
          Lynk
        </span>
      </span>
    </Link>
  );
}
