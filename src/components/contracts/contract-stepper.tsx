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
    <ol className="flex items-center gap-0">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <li key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-sm border text-xs font-semibold transition-colors",
                  done && "border-forest bg-forest text-paper",
                  active && "border-rust bg-rust text-paper",
                  !done && !active && "border-border bg-paper text-ink-muted"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step.num}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  active ? "text-rust" : "text-ink-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-px flex-1",
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
