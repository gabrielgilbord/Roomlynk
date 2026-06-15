-- =============================================================================
-- RoomLynk 004 — Exponer schema roomlynk a la Data API (PostgREST)
-- Ejecutar en SQL Editor DESPUÉS del 002 y 003
-- Sin esto, la app devuelve: Invalid schema: roomlynk (PGRST106)
-- =============================================================================

-- Permisos (por si faltan)
GRANT USAGE ON SCHEMA roomlynk TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA roomlynk TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA roomlynk TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA roomlynk TO anon, authenticated, service_role;

-- Exponer schema en PostgREST (mantiene public y graphql_public)
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, roomlynk';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
