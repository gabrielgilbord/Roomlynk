-- RoomLynk 004 — Exponer schema roomlynk a la Data API (PostgREST)
GRANT USAGE ON SCHEMA roomlynk TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA roomlynk TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA roomlynk TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA roomlynk TO anon, authenticated, service_role;

ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, roomlynk';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
