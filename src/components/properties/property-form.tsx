"use client";

import { createPropertyAction } from "@/app/actions/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

export function PropertyForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await createPropertyAction(formData)) ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Nombre del inmueble" name="name" placeholder="Piso Gran Vía" required />
        <Input label="Ciudad" name="city" placeholder="Madrid" required />
      </div>
      <Input label="Dirección" name="address" placeholder="Calle Gran Vía 12, 3º B" required />
      <Input label="Código postal" name="postalCode" placeholder="28013" />

      <div className="border-t border-border pt-5">
        <p className="mb-4 text-sm font-medium text-ink">Primera habitación</p>
        <div className="grid gap-5 sm:grid-cols-3">
          <Input label="Nombre" name="roomName" defaultValue="Habitación 1" required />
          <Input
            label="Renta mensual (€)"
            name="monthlyRent"
            type="number"
            min="0"
            step="0.01"
            placeholder="650"
            required
          />
          <Input
            label="Nº habitaciones total"
            name="totalRooms"
            type="number"
            min="1"
            defaultValue="1"
            required
          />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-sm border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Registrar inmueble"}
      </Button>
    </form>
  );
}
