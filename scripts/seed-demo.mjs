/**
 * Seed de usuarios demo RoomLynk (Yopmail)
 * Ejecutar DESPUÉS de aplicar migraciones 002 y 003 en Supabase SQL Editor.
 *
 *   node scripts/seed-demo.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) throw new Error("Falta .env.local");
  const lines = readFileSync(envPath, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.SUPABASE_SERVICE_ROLE_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("❌ Configura NEXT_PUBLIC_SUPABASE_URL y clave en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  db: { schema: "roomlynk" },
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "RoomLynk2026!";

const USERS = [
  {
    email: "roomlynk.superadmin@yopmail.com",
    full_name: "Admin RoomLynk",
    role: "superadmin",
  },
  {
    email: "roomlynk.casero@yopmail.com",
    full_name: "María García",
    role: "casero",
    dni_nie: "12345678A",
    phone: "612345678",
  },
  {
    email: "roomlynk.inquilino@yopmail.com",
    full_name: "Laura Martínez",
    role: "inquilino",
    dni_nie: "87654321B",
    phone: "698765432",
    bank_account: "ES1234567890123456789012",
  },
];

const hasServiceRole = Boolean(env.SUPABASE_SERVICE_ROLE_KEY);

async function ensureUser(user) {
  if (hasServiceRole) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === user.email);

    if (existing) {
      const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: user.full_name, role: user.role },
      });
      if (error) {
        console.warn(`⚠️  ${user.email}: ${error.message}`);
        return null;
      }
      return data.user;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role },
    });
    if (error) {
      console.warn(`⚠️  ${user.email}: ${error.message}`);
      return null;
    }
    return data.user;
  }

  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email: user.email,
    password: PASSWORD,
    options: { data: { full_name: user.full_name, role: user.role } },
  });

  if (signUpError && !signUpError.message.includes("already")) {
    const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: PASSWORD,
    });
    if (signInError) {
      console.warn(`⚠️  ${user.email}: ${signInError.message}`);
      return null;
    }
    return signIn.user;
  }

  if (signUp?.user) return signUp.user;

  const { data: signIn } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: PASSWORD,
  });
  return signIn?.user ?? null;
}

async function main() {
  console.log("🌱 RoomLynk — Seed demo\n");

  if (!hasServiceRole) {
    console.log(
      "ℹ️  Sin SUPABASE_SERVICE_ROLE_KEY: los usuarios pueden quedar sin confirmar.\n" +
        "   Opción A: añade la service role en .env.local y vuelve a ejecutar npm run seed\n" +
        "   Opción B: ejecuta scripts/setup-005-demo-users.sql en Supabase SQL Editor\n"
    );
  }

  const { error: schemaCheck } = await supabase.from("profiles").select("id").limit(1);
  if (schemaCheck?.message?.includes("schema") || schemaCheck?.code === "PGRST106") {
    console.error(
      "❌ El esquema roomlynk no está listo.\n" +
        "   Si ya ejecutaste 002 → scripts/setup-003-only.sql\n" +
        "   Si no → supabase/migrations/002_roomlynk_schema.sql\n" +
        "   Verifica con: npm run db:verify\n"
    );
    process.exit(1);
  }

  const userIds = {};

  for (const user of USERS) {
    const authUser = await ensureUser(user);
    if (!authUser) continue;

    userIds[user.role] = authUser.id;

    await supabase
      .from("profiles")
      .update({
        role: user.role,
        full_name: user.full_name,
        dni_nie: user.dni_nie ?? null,
        phone: user.phone ?? null,
        bank_account: user.bank_account ?? null,
      })
      .eq("id", authUser.id);

    console.log(`✅ ${user.role.padEnd(12)} ${user.email}`);
  }

  const caseroId = userIds.casero;
  const inquilinoId = userIds.inquilino;

  if (!caseroId) {
    console.log("\n⚠️  Sin casero, saltando datos demo.");
    printCredentials();
    return;
  }

  // Propiedad demo
  let { data: property } = await supabase
    .from("properties")
    .select("id, rooms(id, name)")
    .eq("owner_id", caseroId)
    .eq("name", "Piso Gran Vía 12")
    .maybeSingle();

  if (!property) {
    const { data: newProp, error } = await supabase
      .from("properties")
      .insert({
        owner_id: caseroId,
        name: "Piso Gran Vía 12",
        address: "Calle Gran Vía 12, 3º B",
        city: "Madrid",
        postal_code: "28013",
        total_rooms: 3,
      })
      .select("id")
      .single();

    if (error) {
      console.warn("⚠️  Propiedad:", error.message);
    } else {
      const rooms = [
        { name: "Habitación 1", monthly_rent: 600, deposit: 600, is_occupied: false },
        { name: "Habitación 2", monthly_rent: 650, deposit: 650, is_occupied: false },
        { name: "Habitación 3", monthly_rent: 550, deposit: 550, is_occupied: false },
      ];
      for (const r of rooms) {
        await supabase.from("rooms").insert({ property_id: newProp.id, ...r });
      }
      property = { id: newProp.id };
      console.log("✅ Propiedad demo creada");
    }
  }

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("property_id", property?.id)
    .order("name");

  const freeRoom = rooms?.find((r) => !r.is_occupied) ?? rooms?.[1];

  const { data: template } = await supabase
    .from("contract_templates")
    .select("id")
    .eq("slug", "habitacion-temporada-v1")
    .single();

  if (freeRoom && template && inquilinoId) {
    const { data: existingInv } = await supabase
      .from("invitations")
      .select("token, contract_id")
      .eq("room_id", freeRoom.id)
      .is("used_at", null)
      .maybeSingle();

    if (!existingInv) {
      const start = new Date();
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);

      const { data: contract, error: cErr } = await supabase
        .from("contracts")
        .insert({
          room_id: freeRoom.id,
          template_id: template.id,
          casero_id: caseroId,
          status: "pendiente_inquilino",
          monthly_rent: freeRoom.monthly_rent,
          deposit_amount: freeRoom.deposit,
          start_date: start.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
        })
        .select("id")
        .single();

      if (!cErr && contract) {
        const { data: inv } = await supabase
          .from("invitations")
          .insert({
            room_id: freeRoom.id,
            contract_id: contract.id,
            email: "roomlynk.inquilino@yopmail.com",
            created_by: caseroId,
          })
          .select("token")
          .single();

        if (inv?.token) {
          console.log(`\n🔗 Invitación demo: http://localhost:3000/invitation/${inv.token}`);
        }
      }
    } else {
      console.log(`\n🔗 Invitación existente: http://localhost:3000/invitation/${existingInv.token}`);
    }

    // Gasto demo para habitación ocupada (si hay inquilino asignado)
    const occupiedRoom = rooms?.find((r) => r.tenant_id === inquilinoId);
    if (occupiedRoom) {
      const { count } = await supabase
        .from("expenses")
        .select("*", { count: "exact", head: true })
        .eq("room_id", occupiedRoom.id);

      if (count === 0) {
        const due = new Date();
        due.setMonth(due.getMonth() + 1);
        await supabase.from("expenses").insert({
          property_id: property.id,
          room_id: occupiedRoom.id,
          type: "luz",
          description: "Factura de luz — Junio",
          total_amount: 46.88,
          amount_per_room: 46.88,
          billing_period: new Date().toISOString().slice(0, 10),
          due_date: due.toISOString().slice(0, 10),
          created_by: caseroId,
        });
        console.log("✅ Gasto demo creado");
      }
    }
  }

  printCredentials();
}

function printCredentials() {
  console.log("\n" + "═".repeat(50));
  console.log("📧 CREDENCIALES DEMO (Yopmail)");
  console.log("═".repeat(50));
  console.log(`Contraseña para todos: ${PASSWORD}`);
  console.log("");
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(12)} → ${u.email}`);
    console.log(`  ${"".padEnd(12)}   https://yopmail.com/es/?${u.email.split("@")[0]}`);
  }
  console.log("═".repeat(50));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
