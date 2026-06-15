import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-sm border bg-paper px-3.5 py-2.5 text-sm text-ink",
          "placeholder:text-ink-muted/60 transition-colors",
          "focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-rust/40 focus:border-rust",
          error ? "border-rust" : "border-border hover:border-border-strong",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rust">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
