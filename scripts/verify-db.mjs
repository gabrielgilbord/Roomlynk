/**
 * Verifica estado del schema roomlynk en Supabase
 *   node scripts/verify-db.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
if (!existsSync(envPath)) {
  console.error("❌ Falta .env.local");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { db: { schema: "roomlynk" } }
);

const tables = [
  "profiles",
  "properties",
  "rooms",
  "contracts",
  "invitations",
  "contract_templates",
  "expenses",
  "incidents",
  "legal_signatures",
];

console.log("🔍 Verificando schema roomlynk...\n");

let ok = 0;
for (const table of tables) {
  const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) {
    if (error.code === "PGRST106" || error.message?.includes("Invalid schema")) {
      console.log(`  ❌ ${table}: schema roomlynk no expuesto en Data API`);
    } else {
      console.log(`  ❌ ${table}: ${error.message}`);
    }
  } else {
    console.log(`  ✅ ${table}`);
    ok++;
  }
}

const { data: rpc, error: rpcErr } = await supabase.rpc("fetch_invitation_by_token", {
  p_token: "00000000000000000000000000000000",
});

if (rpcErr?.message?.includes("Could not find the function")) {
  console.log("\n  ❌ RPC fetch_invitation_by_token: NO existe → ejecuta setup-003-only.sql");
} else if (rpcErr) {
  console.log(`\n  ⚠️  RPC fetch_invitation_by_token: ${rpcErr.message}`);
} else {
  console.log("\n  ✅ RPC fetch_invitation_by_token");
}

console.log(`\n${ok}/${tables.length} tablas accesibles.`);

if (ok === tables.length && !rpcErr?.message?.includes("Could not find")) {
  console.log("\n✅ Base de datos lista. Ejecuta: npm run seed");
} else if (rpcErr?.code === "PGRST106" || tables.every((t) => true) && ok === 0) {
  console.log("\n→ Falta exponer el schema. Ejecuta en SQL Editor:");
  console.log("   scripts/setup-004-expose-schema.sql");
  console.log("   (o Dashboard → Settings → API → Exposed schemas → añade roomlynk)");
} else if (ok > 0) {
  console.log("\n→ Tienes el 002. Ejecuta en SQL Editor: scripts/setup-003-only.sql");
} else {
  console.log("\n→ Ejecuta primero: supabase/migrations/002_roomlynk_schema.sql");
}
