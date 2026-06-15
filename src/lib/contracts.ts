import type { ContractPlaceholders, TenantData } from "@/types/contracts";

export function injectPlaceholders(
  templateHtml: string,
  placeholders: ContractPlaceholders
): string {
  let rendered = templateHtml;

  const entries = Object.entries(placeholders) as [keyof ContractPlaceholders, string][];

  for (const [key, value] of entries) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }

  return rendered;
}

export function buildPlaceholders(
  tenant: TenantData,
  casero: { name: string; dni: string },
  property: { address: string; city: string; roomName: string },
  contract: { startDate: string; endDate: string; rent: number; deposit: number }
): ContractPlaceholders {
  return {
    inquilino_nombre: tenant.fullName,
    inquilino_dni: tenant.dniNie.toUpperCase(),
    inquilino_telefono: tenant.phone,
    inquilino_cuenta: tenant.bankAccount.toUpperCase(),
    casero_nombre: casero.name,
    casero_dni: casero.dni,
    habitacion_nombre: property.roomName,
    propiedad_direccion: property.address,
    propiedad_ciudad: property.city,
    ciudad: property.city,
    fecha_contrato: new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    fecha_inicio: new Date(contract.startDate).toLocaleDateString("es-ES"),
    fecha_fin: new Date(contract.endDate).toLocaleDateString("es-ES"),
    renta_mensual: contract.rent.toFixed(2),
    fianza: contract.deposit.toFixed(2),
  };
}

export async function generateDocumentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
