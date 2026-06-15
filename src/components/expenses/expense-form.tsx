"use client";

import { createExpenseAction } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Property, Room } from "@/types/database";
import { useActionState } from "react";

type PropertyWithRooms = Property & { rooms: Room[] };

interface ExpenseFormProps {
  properties: PropertyWithRooms[];
}

export function ExpenseForm({ properties }: ExpenseFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return (await createExpenseAction(formData)) ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Inmueble</label>
        <select
          name="propertyId"
          required
          className="w-full rounded-sm border border-border bg-paper px-3.5 py-2.5 text-sm"
        >
          <option value="">Seleccionar…</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Tipo</label>
        <select name="type" className="w-full rounded-sm border border-border bg-paper px-3.5 py-2.5 text-sm">
          <option value="luz">Luz</option>
          <option value="agua">Agua</option>
          <option value="gas">Gas</option>
          <option value="internet">Internet</option>
          <option value="comunidad">Comunidad</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <Input label="Descripción" name="description" placeholder="Factura de luz — Junio" required />

      <Input
        label="Importe total (€)"
        name="totalAmount"
        type="number"
        min="0"
        step="0.01"
        required
      />

      <Input label="Fecha de vencimiento" name="dueDate" type="date" required />

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="splitCommon" defaultChecked className="rounded-sm" />
        Repartir entre habitaciones ocupadas
      </label>

      {state?.error && <p className="text-sm text-rust">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-forest">Gasto registrado correctamente.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Registrar gasto"}
      </Button>
    </form>
  );
}
