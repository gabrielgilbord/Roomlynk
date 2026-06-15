# RoomLynk MVP

SaaS de gestión de coliving con auth, contratos digitales, gastos repartidos e incidencias.

## Setup rápido (5 minutos)

### 1. MCP Cursor (ya configurado)

`.cursor/mcp.json` apunta a tu proyecto Supabase `swifgilmkpktxwcfmuea`.

### 2. Base de datos

Abre el [SQL Editor de Supabase](https://supabase.com/dashboard/project/swifgilmkpktxwcfmuea/sql/new) y ejecuta **todo** el archivo:

```
scripts/setup-all.sql
```

Luego en **Settings → API → Data API → Exposed schemas**, añade `roomlynk`.

### 3. Auth (desarrollo)

En **Authentication → Providers → Email**, desactiva **Confirm email** para poder usar Yopmail sin confirmar.

### 4. Variables de entorno

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://swifgilmkpktxwcfmuea.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_clave
```

### 5. Seed de usuarios demo

```bash
npm run seed
```

## Credenciales demo (Yopmail)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Superadmin | roomlynk.superadmin@yopmail.com | `RoomLynk2026!` |
| Casero | roomlynk.casero@yopmail.com | `RoomLynk2026!` |
| Inquilino | roomlynk.inquilino@yopmail.com | `RoomLynk2026!` |

Bandeja Yopmail: https://yopmail.com/es/ (busca el alias sin @yopmail.com)

## Arrancar

```bash
npm run dev
```

## Flujo MVP completo

1. **Casero** → login → Inmuebles → registrar piso
2. **Casero** → Contratos → generar invitación con email del inquilino
3. **Inquilino** → abrir enlace `/invitation/[token]` → login → firmar contrato
4. **Casero** → Gastos → registrar luz con "repartir entre habitaciones"
5. **Inquilino** → Facturas → marcar pagado
6. **Inquilino** → Averías → reportar incidencia
7. **Casero** → Incidencias → resolver
8. **Superadmin** → métricas, caseros, plantillas legales

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` `/register` | Auth |
| `/dashboard/casero` | Panel casero |
| `/dashboard/inquilino` | Panel inquilino |
| `/dashboard/superadmin` | Panel admin SaaS |
| `/invitation/[token]` | Firma de contrato |

## Esquema

Tablas en schema aislado `roomlynk` (no colisiona con otras apps del mismo proyecto Supabase).
