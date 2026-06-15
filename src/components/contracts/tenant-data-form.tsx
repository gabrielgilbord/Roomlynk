"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tenantDataSchema, type TenantData } from "@/types/contracts";
import { useState } from "react";

interface TenantDataFormProps {
  initialData?: Partial<TenantData>;
  onSubmit: (data: TenantData) => void;
}

type FormErrors = Partial<Record<keyof TenantData, string>>;

export function TenantDataForm({ initialData, onSubmit }: TenantDataFormProps) {
  const [formData, setFormData] = useState<Partial<TenantData>>({
    fullName: initialData?.fullName ?? "",
    dniNie: initialData?.dniNie ?? "",
    phone: initialData?.phone ?? "",
    bankAccount: initialData?.bankAccount ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof TenantData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = tenantDataSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof TenantData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-6">
        <h2 className="rl-display text-lg font-medium text-ink">
          Datos personales
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Se incluirán automáticamente en tu contrato.
        </p>
      </div>

      <Input
        label="Nombre completo"
        placeholder="Ej: Laura Martínez García"
        value={formData.fullName}
        onChange={(e) => handleChange("fullName", e.target.value)}
        error={errors.fullName}
      />

      <Input
        label="DNI / NIE"
        placeholder="Ej: 12345678A o X1234567L"
        value={formData.dniNie}
        onChange={(e) => handleChange("dniNie", e.target.value.toUpperCase())}
        error={errors.dniNie}
        hint="Formato español: 8 dígitos + letra o NIE con X/Y/Z"
      />

      <Input
        label="Teléfono"
        placeholder="Ej: 612345678"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        error={errors.phone}
      />

      <Input
        label="Cuenta bancaria (IBAN)"
        placeholder="Ej: ES1234567890123456789012"
        value={formData.bankAccount}
        onChange={(e) =>
          handleChange("bankAccount", e.target.value.toUpperCase().replace(/\s/g, ""))
        }
        error={errors.bankAccount}
        hint="Necesario para domiciliación de renta y fianza"
      />

      <div className="rounded-sm border border-border bg-linen p-4">
        <p className="text-xs text-ink-muted">
          Tus datos bancarios están protegidos bajo RGPD. Solo tú y tu casero
          tendréis acceso.
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full">
        Continuar a revisión del contrato
      </Button>
    </form>
  );
}
