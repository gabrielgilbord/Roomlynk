import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-4 sm:p-6",
  lg: "p-5 sm:p-8",
};

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-paper shadow-[0_1px_0_rgba(26,22,20,0.04)]",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
