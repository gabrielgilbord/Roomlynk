-- =============================================================================
-- RoomLynk 005 — Usuarios demo Yopmail + fix RLS + confirmar emails
-- Ejecutar en Supabase SQL Editor (como postgres)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fix recursión infinita: is_superadmin() debe saltarse RLS
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

-- Confirmar emails de cuentas ya creadas
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email IN (
  'roomlynk.superadmin@yopmail.com',
  'roomlynk.casero@yopmail.com',
  'roomlynk.inquilino@yopmail.com'
);

-- Crear inquilino si no existe
DO $$
DECLARE
  user_id uuid;
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = 'roomlynk.inquilino@yopmail.com';

  IF existing_id IS NULL THEN
    user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token,
      email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id, 'authenticated', 'authenticated',
      'roomlynk.inquilino@yopmail.com',
      crypt('RoomLynk2026!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Laura Martínez","role":"inquilino"}',
      NOW(), NOW(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      user_id,
      jsonb_build_object('sub', user_id::text, 'email', 'roomlynk.inquilino@yopmail.com'),
      'email',
      user_id::text,
      NOW(), NOW(), NOW()
    );
  ELSE
    user_id := existing_id;
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = user_id;
  END IF;

  -- Perfil inquilino (por si el trigger no corrió)
  INSERT INTO roomlynk.profiles (id, email, full_name, role, dni_nie, phone, bank_account)
  SELECT user_id, 'roomlynk.inquilino@yopmail.com', 'Laura Martínez', 'inquilino',
         '87654321B', '698765432', 'ES1234567890123456789012'
  WHERE NOT EXISTS (SELECT 1 FROM roomlynk.profiles WHERE id = user_id);
END $$;

-- Asegurar roles correctos en perfiles
UPDATE roomlynk.profiles SET role = 'superadmin', full_name = 'Admin RoomLynk'
WHERE email = 'roomlynk.superadmin@yopmail.com';

UPDATE roomlynk.profiles SET role = 'casero', full_name = 'María García', dni_nie = '12345678A', phone = '612345678'
WHERE email = 'roomlynk.casero@yopmail.com';

UPDATE roomlynk.profiles SET role = 'inquilino', full_name = 'Laura Martínez',
  dni_nie = '87654321B', phone = '698765432', bank_account = 'ES1234567890123456789012'
WHERE email = 'roomlynk.inquilino@yopmail.com';

-- Verificación
SELECT u.email, u.email_confirmed_at IS NOT NULL AS confirmado, p.role
FROM auth.users u
LEFT JOIN roomlynk.profiles p ON p.id = u.id
WHERE u.email LIKE 'roomlynk.%@yopmail.com'
ORDER BY u.email;
