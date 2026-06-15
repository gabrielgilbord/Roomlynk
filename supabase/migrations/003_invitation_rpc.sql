-- =============================================================================
-- RoomLynk 003 — RPC invitaciones, reparto gastos, RLS firma digital
-- Ejecutar DESPUÉS de 002. Idempotente.
-- =============================================================================

CREATE OR REPLACE FUNCTION roomlynk.fetch_invitation_by_token(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = roomlynk, public
AS $$
DECLARE
  result JSON;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN
    RETURN NULL;
  END IF;

  SELECT json_build_object(
    'invitation_id', i.id,
    'token', i.token,
    'email', i.email,
    'expires_at', i.expires_at,
    'room_id', r.id,
    'room_name', r.name,
    'monthly_rent', r.monthly_rent,
    'deposit', r.deposit,
    'property_name', p.name,
    'property_address', p.address,
    'property_city', p.city,
    'contract_id', c.id,
    'contract_status', c.status,
    'template_html', t.content_html,
    'template_type', t.type,
    'casero_name', pr.full_name,
    'casero_dni', COALESCE(pr.dni_nie, '—'),
    'start_date', c.start_date,
    'end_date', c.end_date
  ) INTO result
  FROM roomlynk.invitations i
  JOIN roomlynk.rooms r ON r.id = i.room_id
  JOIN roomlynk.properties p ON p.id = r.property_id
  JOIN roomlynk.contracts c ON c.id = i.contract_id
  JOIN roomlynk.contract_templates t ON t.id = c.template_id
  JOIN roomlynk.profiles pr ON pr.id = c.casero_id
  WHERE i.token = p_token
    AND i.expires_at > NOW()
    AND i.used_at IS NULL
    AND c.status = 'pendiente_inquilino'
    AND c.is_locked = FALSE;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION roomlynk.fetch_invitation_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION roomlynk.fetch_invitation_by_token(TEXT) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION roomlynk.split_common_expense(p_expense_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = roomlynk, public
AS $$
DECLARE
  exp RECORD;
  active_rooms INT;
  per_room DECIMAL(10,2);
  r RECORD;
BEGIN
  SELECT * INTO exp FROM roomlynk.expenses WHERE id = p_expense_id;
  IF exp IS NULL OR exp.room_id IS NOT NULL THEN RETURN; END IF;

  SELECT COUNT(*) INTO active_rooms
  FROM roomlynk.rooms
  WHERE property_id = exp.property_id AND is_occupied = TRUE;

  IF active_rooms = 0 THEN RETURN; END IF;

  per_room := ROUND(exp.total_amount / active_rooms, 2);

  FOR r IN
    SELECT id FROM roomlynk.rooms
    WHERE property_id = exp.property_id AND is_occupied = TRUE
  LOOP
    INSERT INTO roomlynk.expenses (
      property_id, room_id, type, description, total_amount,
      amount_per_room, billing_period, due_date, status, created_by
    ) VALUES (
      exp.property_id, r.id, exp.type,
      exp.description || ' (tu parte)',
      per_room, per_room, exp.billing_period, exp.due_date,
      'pendiente', exp.created_by
    );
  END LOOP;

  DELETE FROM roomlynk.expenses WHERE id = p_expense_id;
END;
$$;

REVOKE ALL ON FUNCTION roomlynk.split_common_expense(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION roomlynk.split_common_expense(UUID) TO authenticated, service_role;

DROP POLICY IF EXISTS "rl_expenses_inquilino" ON roomlynk.expenses;
CREATE POLICY "rl_expenses_inquilino" ON roomlynk.expenses FOR SELECT USING (
  room_id IN (SELECT id FROM roomlynk.rooms WHERE tenant_id = auth.uid())
);

DROP POLICY IF EXISTS "rl_contracts_invitation_read" ON roomlynk.contracts;
CREATE POLICY "rl_contracts_invitation_read" ON roomlynk.contracts FOR SELECT USING (
  status = 'pendiente_inquilino'
  AND EXISTS (
    SELECT 1 FROM roomlynk.invitations inv
    WHERE inv.contract_id = contracts.id
      AND inv.used_at IS NULL
      AND inv.expires_at > NOW()
  )
);

DROP POLICY IF EXISTS "rl_contracts_inquilino_update" ON roomlynk.contracts;
CREATE POLICY "rl_contracts_inquilino_update" ON roomlynk.contracts FOR UPDATE
  USING (
    status = 'pendiente_inquilino' AND is_locked = FALSE
    AND (
      inquilino_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM roomlynk.invitations inv
        WHERE inv.contract_id = contracts.id
          AND inv.used_at IS NULL
          AND inv.expires_at > NOW()
      )
    )
  )
  WITH CHECK (inquilino_id = auth.uid());
