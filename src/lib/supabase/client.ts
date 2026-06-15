import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl, ROOMLYNK_SCHEMA } from "./env";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    db: { schema: ROOMLYNK_SCHEMA },
  });
}
