import { z } from "zod";

export const tenantDataSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo"),
  dniNie: z
    .string()
    .regex(
      /^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/i,
      "Formato de DNI/NIE inválido"
    ),
  phone: z
    .string()
    .regex(/^(\+34|0034|34)?[6-9]\d{8}$/, "Teléfono español inválido"),
  bankAccount: z
    .string()
    .regex(/^ES\d{22}$/i, "IBAN español inválido (formato: ES + 22 dígitos)"),
});

export type TenantData = z.infer<typeof tenantDataSchema>;

export interface ContractPlaceholders {
  inquilino_nombre: string;
  inquilino_dni: string;
  inquilino_telefono: string;
  inquilino_cuenta: string;
  casero_nombre: string;
  casero_dni: string;
  habitacion_nombre: string;
  propiedad_direccion: string;
  propiedad_ciudad: string;
  ciudad: string;
  fecha_contrato: string;
  fecha_inicio: string;
  fecha_fin: string;
  renta_mensual: string;
  fianza: string;
}

export type ContractStep = "datos" | "revision" | "firma" | "confirmacion";

export interface SignaturePayload {
  signatureData: string;
  ipAddress: string;
  userAgent: string;
  documentHash: string;
  signedAt: string;
}
