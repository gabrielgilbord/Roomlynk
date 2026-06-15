"use client";

import { createIncidentAction } from "@/app/actions/incidents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IncidentFormProps {
  propertyId: string;
  roomId?: string;
}

export function IncidentForm({ propertyId, roomId }: IncidentFormProps) {
  return (
    <form
      action={async (formData) => {
        await createIncidentAction(formData);
      }}
      className="space-y-4"
    >
      <input type="hidden" name="propertyId" value={propertyId} />
      {roomId && <input type="hidden" name="roomId" value={roomId} />}

      <Input label="Título" name="title" placeholder="Fuga en el baño" required />

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Descripción</label>
        <textarea
          name="description"
          rows={4}
          required
          placeholder="Describe el problema con detalle…"
          className="w-full rounded-sm border border-border bg-paper px-3.5 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Prioridad</label>
        <select name="priority" className="w-full rounded-sm border border-border bg-paper px-3.5 py-2.5 text-sm">
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>

      <Button type="submit">Enviar incidencia</Button>
    </form>
  );
}
