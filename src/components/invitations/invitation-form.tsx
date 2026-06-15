"use client";

import { createInvitationAction } from "@/app/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Room } from "@/types/database";
import { useActionState, useState } from "react";

interface InvitationFormProps {
  rooms: (Room & { properties: { name: string } | null })[];
}

export function InvitationForm({ rooms }: InvitationFormProps) {
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; url?: string; success?: boolean } | null, formData: FormData) => {
      return (await createInvitationAction(formData)) ?? null;
    },
    null
  );

  const copyUrl = () => {
    if (state?.url) {
      navigator.clipboard.writeText(state.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const freeRooms = rooms.filter((r) => !r.is_occupied);

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Habitación libre
          </label>
          <select
            name="roomId"
            required
            className="w-full rounded-sm border border-border bg-paper px-3.5 py-2.5 text-sm"
          >
            <option value="">Seleccionar…</option>
            {freeRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.properties?.name} — {r.name} ({r.monthly_rent} €/mes)
              </option>
            ))}
          </select>
          {freeRooms.length === 0 && (
            <p className="mt-1 text-xs text-ink-muted">No hay habitaciones libres.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Plantilla de contrato
          </label>
          <select
            name="templateSlug"
            className="w-full rounded-sm border border-border bg-paper px-3.5 py-2.5 text-sm"
          >
            <option value="habitacion-temporada-v1">Habitación por temporada</option>
            <option value="vivienda-completa-lau-v1">Vivienda completa LAU</option>
          </select>
        </div>

        <Input
          label="Email del inquilino"
          name="email"
          type="email"
          placeholder="inquilino@yopmail.com"
          required
        />

        {state?.error && (
          <p className="text-sm text-rust">{state.error}</p>
        )}

        <Button type="submit" disabled={pending || freeRooms.length === 0}>
          {pending ? "Generando…" : "Generar invitación"}
        </Button>
      </form>

      {state?.url && (
        <div className="rounded-sm border border-forest/30 bg-forest-light p-4">
          <p className="text-xs font-medium text-forest mb-2">Enlace generado</p>
          <p className="break-all text-sm text-ink">{state.url}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={copyUrl}>
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </Button>
        </div>
      )}
    </div>
  );
}
