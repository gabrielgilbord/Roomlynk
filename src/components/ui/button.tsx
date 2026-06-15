import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust",
          "disabled:pointer-events-none disabled:opacity-40",
          variant === "primary" &&
            "bg-rust text-paper hover:bg-rust-dark active:bg-rust-dark",
          variant === "secondary" &&
            "bg-forest text-paper hover:bg-[#234438]",
          variant === "outline" &&
            "border border-border-strong bg-transparent text-ink hover:bg-paper",
          variant === "ghost" &&
            "text-ink-muted hover:text-ink hover:bg-paper/80",
          size === "sm" && "h-9 px-3.5 text-sm rounded-sm",
          size === "md" && "h-11 px-5 text-sm rounded-sm",
          size === "lg" && "h-12 px-6 text-base rounded-sm",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
