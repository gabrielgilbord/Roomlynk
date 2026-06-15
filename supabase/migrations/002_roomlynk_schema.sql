-- RoomLynk — esquema aislado (no colisiona con otras apps en el mismo proyecto)
CREATE SCHEMA IF NOT EXISTS roomlynk;

CREATE TYPE roomlynk.user_role AS ENUM ('superadmin', 'casero', 'inquilino');
CREATE TYPE roomlynk.contract_status AS ENUM ('borrador', 'pendiente_inquilino', 'firmado', 'vencido');
CREATE TYPE roomlynk.contract_template_type AS ENUM ('habitacion_temporada', 'vivienda_completa_lau');
CREATE TYPE roomlynk.expense_status AS ENUM ('pendiente', 'pagado', 'vencido');
CREATE TYPE roomlynk.expense_type AS ENUM ('luz', 'agua', 'gas', 'internet', 'comunidad', 'otro');
CREATE TYPE roomlynk.incident_status AS ENUM ('abierta', 'en_progreso', 'resuelta', 'cerrada');
CREATE TYPE roomlynk.incident_priority AS ENUM ('baja', 'media', 'alta', 'urgente');

CREATE TABLE roomlynk.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  phone         TEXT,
  dni_nie       TEXT,
  bank_account  TEXT,
  avatar_url    TEXT,
  role          roomlynk.user_role NOT NULL DEFAULT 'inquilino',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roomlynk.contract_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  type          roomlynk.contract_template_type NOT NULL,
  version       INTEGER NOT NULL DEFAULT 1,
  content_html  TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES roomlynk.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roomlynk.properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES roomlynk.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  postal_code   TEXT,
  description   TEXT,
  total_rooms   INTEGER NOT NULL DEFAULT 1,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roomlynk.rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES roomlynk.properties(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  monthly_rent  DECIMAL(10, 2) NOT NULL,
  deposit       DECIMAL(10, 2) DEFAULT 0,
  is_occupied   BOOLEAN NOT NULL DEFAULT FALSE,
  tenant_id     UUID REFERENCES roomlynk.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roomlynk.contracts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id             UUID NOT NULL REFERENCES roomlynk.rooms(id) ON DELETE CASCADE,
  template_id         UUID NOT NULL REFERENCES roomlynk.contract_templates(id),
  casero_id           UUID NOT NULL REFERENCES roomlynk.profiles(id),
  inquilino_id        UUID REFERENCES roomlynk.profiles(id),
  status              roomlynk.contract_status NOT NULL DEFAULT 'borrador',
  tenant_full_name    TEXT,
  tenant_dni_nie      TEXT,
  tenant_phone        TEXT,
  tenant_bank_account TEXT,
  rendered_html       TEXT,
  rendered_pdf_url    TEXT,
  start_date          DATE,
  end_date            DATE,
  monthly_rent        DECIMAL(10, 2),
  deposit_amount      DECIMAL(10, 2),
  is_locked           BOOLEAN NOT NULL DEFAULT FALSE,
  locked_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roomlynk.invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  room_id       UUID NOT NULL REFERENCES roomlynk.rooms(id) ON DELETE CASCADE,
  contract_id   UUID REFERENCES roomlynk.contracts(id) ON DELETE SET NULL,
  email         TEXT,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  used_at       TIMESTAMPTZ,
  created_by    UUID NOT NULL REFERENCES roomlynk.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roomlynk.legal_signatures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     UUID NOT NULL REFERENCES roomlynk.contracts(id) ON DELETE RESTRICT,
  signer_id       UUID NOT NULL REFERENCES roomlynk.profiles(id),
  signer_role     roomlynk.user_role NOT NULL,
  signature_data  TEXT NOT NULL,
  signature_type  TEXT NOT NULL DEFAULT 'canvas',
  ip_address      INET NOT NULL,
  user_agent      TEXT,
  signed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_hash   TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roomlynk.expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES roomlynk.properties(id) ON DELETE CASCADE,
  room_id         UUID REFERENCES roomlynk.rooms(id) ON DELETE SET NULL,
  type            roomlynk.expense_type NOT NULL,
  description     TEXT NOT NULL,
  total_amount    DECIMAL(10, 2) NOT NULL,
  amount_per_room DECIMAL(10, 2),
  billing_period  DATE NOT NULL,
  due_date        DATE NOT NULL,
  status          roomlynk.expense_status NOT NULL DEFAULT 'pendiente',
  paid_at         TIMESTAMPTZ,
  created_by      UUID NOT NULL REFERENCES roomlynk.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roomlynk.incidents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES roomlynk.properties(id) ON DELETE CASCADE,
  room_id         UUID REFERENCES roomlynk.rooms(id) ON DELETE SET NULL,
  reported_by     UUID NOT NULL REFERENCES roomlynk.profiles(id),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  status          roomlynk.incident_status NOT NULL DEFAULT 'abierta',
  priority        roomlynk.incident_priority NOT NULL DEFAULT 'media',
  assigned_to     TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: perfil al registrarse
CREATE OR REPLACE FUNCTION roomlynk.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO roomlynk.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::roomlynk.user_role, 'casero')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_roomlynk ON auth.users;
CREATE TRIGGER on_auth_user_created_roomlynk
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION roomlynk.handle_new_user();

-- Trigger: bloquear contrato al firmar
CREATE OR REPLACE FUNCTION roomlynk.lock_contract_on_signature()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE roomlynk.contracts
  SET is_locked = TRUE, locked_at = NOW(), status = 'firmado'
  WHERE id = NEW.contract_id AND is_locked = FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_lock_contract_on_signature
  AFTER INSERT ON roomlynk.legal_signatures
  FOR EACH ROW EXECUTE FUNCTION roomlynk.lock_contract_on_signature();

-- RLS
ALTER TABLE roomlynk.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomlynk.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomlynk.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomlynk.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomlynk.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomlynk.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomlynk.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomlynk.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomlynk.legal_signatures ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION roomlynk.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM roomlynk.profiles WHERE id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "rl_profiles_select_own" ON roomlynk.profiles FOR SELECT USING (auth.uid() = id OR roomlynk.is_superadmin());
CREATE POLICY "rl_profiles_update_own" ON roomlynk.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "rl_profiles_insert_own" ON roomlynk.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "rl_properties_casero" ON roomlynk.properties FOR ALL USING (owner_id = auth.uid() OR roomlynk.is_superadmin());
CREATE POLICY "rl_properties_inquilino_read" ON roomlynk.properties FOR SELECT USING (
  EXISTS (SELECT 1 FROM roomlynk.rooms r WHERE r.property_id = properties.id AND r.tenant_id = auth.uid())
);

CREATE POLICY "rl_rooms_casero" ON roomlynk.rooms FOR ALL USING (
  EXISTS (SELECT 1 FROM roomlynk.properties p WHERE p.id = rooms.property_id AND p.owner_id = auth.uid())
  OR roomlynk.is_superadmin()
);
CREATE POLICY "rl_rooms_inquilino_read" ON roomlynk.rooms FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "rl_contracts_casero" ON roomlynk.contracts FOR ALL USING (casero_id = auth.uid() OR roomlynk.is_superadmin());
CREATE POLICY "rl_contracts_inquilino" ON roomlynk.contracts FOR SELECT USING (inquilino_id = auth.uid());
CREATE POLICY "rl_contracts_inquilino_update" ON roomlynk.contracts FOR UPDATE USING (
  inquilino_id = auth.uid() AND status = 'pendiente_inquilino' AND is_locked = FALSE
);

CREATE POLICY "rl_templates_read" ON roomlynk.contract_templates FOR SELECT USING (is_active = TRUE);
CREATE POLICY "rl_templates_admin" ON roomlynk.contract_templates FOR ALL USING (roomlynk.is_superadmin());

CREATE POLICY "rl_expenses_casero" ON roomlynk.expenses FOR ALL USING (
  EXISTS (SELECT 1 FROM roomlynk.properties p WHERE p.id = expenses.property_id AND p.owner_id = auth.uid())
);
CREATE POLICY "rl_expenses_inquilino" ON roomlynk.expenses FOR SELECT USING (
  room_id IN (SELECT id FROM roomlynk.rooms WHERE tenant_id = auth.uid())
);

CREATE POLICY "rl_incidents_all" ON roomlynk.incidents FOR ALL USING (
  reported_by = auth.uid()
  OR EXISTS (SELECT 1 FROM roomlynk.properties p WHERE p.id = incidents.property_id AND p.owner_id = auth.uid())
  OR roomlynk.is_superadmin()
);

CREATE POLICY "rl_invitations_casero" ON roomlynk.invitations FOR ALL USING (created_by = auth.uid() OR roomlynk.is_superadmin());
CREATE POLICY "rl_signatures_insert" ON roomlynk.legal_signatures FOR INSERT WITH CHECK (signer_id = auth.uid());
CREATE POLICY "rl_signatures_read" ON roomlynk.legal_signatures FOR SELECT USING (
  signer_id = auth.uid() OR roomlynk.is_superadmin()
  OR EXISTS (SELECT 1 FROM roomlynk.contracts c WHERE c.id = contract_id AND c.casero_id = auth.uid())
);

-- Exponer schema a la API
GRANT USAGE ON SCHEMA roomlynk TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA roomlynk TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA roomlynk TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA roomlynk GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- Plantillas seed
INSERT INTO roomlynk.contract_templates (name, slug, type, content_html) VALUES
(
  'Alquiler de Habitación por Temporada',
  'habitacion-temporada-v1',
  'habitacion_temporada',
  '<h1>CONTRATO DE ARRENDAMIENTO DE HABITACIÓN POR TEMPORADA</h1>
   <p>En {{ciudad}}, a {{fecha_contrato}}.</p>
   <p><strong>ARRENDADOR:</strong> {{casero_nombre}}, DNI {{casero_dni}}.</p>
   <p><strong>ARRENDATARIO:</strong> {{inquilino_nombre}}, DNI/NIE {{inquilino_dni}}, tel. {{inquilino_telefono}}, IBAN {{inquilino_cuenta}}.</p>
   <p>Habitación <strong>{{habitacion_nombre}}</strong> en {{propiedad_direccion}}, {{propiedad_ciudad}}.</p>
   <p>Renta: <strong>{{renta_mensual}} €</strong> · Fianza: <strong>{{fianza}} €</strong> · Vigencia: {{fecha_inicio}} — {{fecha_fin}}.</p>'
),
(
  'Alquiler de Vivienda Completa LAU',
  'vivienda-completa-lau-v1',
  'vivienda_completa_lau',
  '<h1>CONTRATO DE ARRENDAMIENTO DE VIVIENDA (LAU)</h1>
   <p>En {{ciudad}}, a {{fecha_contrato}}.</p>
   <p><strong>ARRENDADOR:</strong> {{casero_nombre}}, DNI {{casero_dni}}.</p>
   <p><strong>ARRENDATARIO:</strong> {{inquilino_nombre}}, DNI/NIE {{inquilino_dni}}, tel. {{inquilino_telefono}}, IBAN {{inquilino_cuenta}}.</p>
   <p>Vivienda en {{propiedad_direccion}}, {{propiedad_ciudad}}.</p>
   <p>Renta: <strong>{{renta_mensual}} €</strong> · Fianza: <strong>{{fianza}} €</strong> · Vigencia: {{fecha_inicio}} — {{fecha_fin}}.</p>'
);
