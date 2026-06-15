"use client";

import { cn } from "@/lib/utils";
import type { ContractStep } from "@/types/contracts";
import { Check } from "lucide-react";

const steps: { id: ContractStep; label: string; num: number }[] = [
  { id: "datos", label: "Datos", num: 1 },
  { id: "revision", label: "Revisión", num: 2 },
  { id: "firma", label: "Firma", num: 3 },
  { id: "confirmacion", label: "Listo", num: 4 },
];

interface ContractStepperProps {
  currentStep: ContractStep;
}

export function ContractStepper({ currentStep }: ContractStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <ol className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:gap-0">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <li key={step.id} className="flex min-w-0 flex-col items-center sm:flex-1 sm:flex-row">
            <div className="flex w-full min-w-0 flex-col items-center gap-1 sm:gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border text-xs font-semibold transition-colors",
                  done && "border-forest bg-forest text-paper",
                  active && "border-rust bg-rust text-paper",
                  !done && !active && "border-border bg-paper text-ink-muted"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step.num}
              </div>
              <span
                className={cn(
                  "w-full truncate text-center text-[10px] font-medium sm:text-[11px]",
                  active ? "text-rust" : "text-ink-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "hidden h-px flex-1 sm:mx-2 sm:mb-5 sm:block",
                  index < currentIndex ? "bg-forest" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
