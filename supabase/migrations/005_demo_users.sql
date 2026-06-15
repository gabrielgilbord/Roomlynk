-- RoomLynk 005 — Fix RLS is_superadmin (sin tocar auth.users)
-- Para usuarios demo, ejecutar scripts/setup-005-demo-users.sql en SQL Editor

CREATE OR REPLACE FUNCTION roomlynk.is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = roomlynk
STABLE
AS $$
DECLARE
  result boolean;
BEGIN
  PERFORM set_config('row_security', 'off', true);
  SELECT EXISTS (
    SELECT 1 FROM roomlynk.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  ) INTO result;
  RETURN COALESCE(result, false);
END;
$$;
