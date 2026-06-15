export type UserRole = "superadmin" | "casero" | "inquilino";

export type ContractStatus =
  | "borrador"
  | "pendiente_inquilino"
  | "firmado"
  | "vencido";

export type ContractTemplateType =
  | "habitacion_temporada"
  | "vivienda_completa_lau";

export type ExpenseStatus = "pendiente" | "pagado" | "vencido";

export type ExpenseType =
  | "luz"
  | "agua"
  | "gas"
  | "internet"
  | "comunidad"
  | "otro";

export type IncidentStatus =
  | "abierta"
  | "en_progreso"
  | "resuelta"
  | "cerrada";

export type IncidentPriority = "baja" | "media" | "alta" | "urgente";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  dni_nie: string | null;
  bank_account: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string | null;
  description: string | null;
  total_rooms: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  name: string;
  monthly_rent: number;
  deposit: number;
  is_occupied: boolean;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  room_id: string;
  template_id: string;
  casero_id: string;
  inquilino_id: string | null;
  invitation_id: string | null;
  status: ContractStatus;
  tenant_full_name: string | null;
  tenant_dni_nie: string | null;
  tenant_phone: string | null;
  tenant_bank_account: string | null;
  rendered_html: string | null;
  rendered_pdf_url: string | null;
  start_date: string | null;
  end_date: string | null;
  monthly_rent: number | null;
  deposit_amount: number | null;
  is_locked: boolean;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LegalSignature {
  id: string;
  contract_id: string;
  signer_id: string;
  signer_role: UserRole;
  signature_data: string;
  signature_type: string;
  ip_address: string;
  user_agent: string | null;
  signed_at: string;
  document_hash: string;
  created_at: string;
}

export interface Expense {
  id: string;
  property_id: string;
  room_id: string | null;
  type: ExpenseType;
  description: string;
  total_amount: number;
  amount_per_room: number | null;
  billing_period: string;
  due_date: string;
  status: ExpenseStatus;
  paid_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  property_id: string;
  room_id: string | null;
  reported_by: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  slug: string;
  type: ContractTemplateType;
  version: number;
  content_html: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  token: string;
  room_id: string;
  contract_id: string | null;
  email: string | null;
  expires_at: string;
  used_at: string | null;
  created_by: string;
  created_at: string;
}
