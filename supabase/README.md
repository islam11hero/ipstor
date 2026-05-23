# Supabase setup (required once)

Your dashboard errors mean the **Supabase project schema does not match the app** yet.

## Quick fix (recommended)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Paste and run **`supabase/setup_repair.sql`** if you already have a `profiles` table (avoids “relation profiles already exists”). Otherwise run **`supabase/setup_all.sql`** (full bootstrap).
3. Confirm **Project Settings → API** env vars on Vercel/local match this project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — needed for admin ops + auto profile repair)
4. Reload `/dashboard` (or sign out / sign in).

## What `setup_all.sql` creates

| Object | Purpose |
|--------|---------|
| `profiles` | User balance + email |
| `orders` | Proxy purchase requests |
| `user_proxies` | Delivered IPs (`username` / `password` columns) |
| `deposits` | Crypto top-ups |
| RLS policies | Users read/write own rows |
| `handle_new_user` trigger | Auto-create `profiles` on signup |
| RPC functions | NowPayments atomic credit |

## Migration files (same content, split)

1. `migrations/20260523090000_base_schema.sql`
2. `migrations/20260523120000_nowpayments_deposit_rpc.sql`

## Admin account

Admin access is **not** stored in Supabase roles. Only this email can open `/admin` (see `lib/admin.ts`):

`salamasalamaislam@gmail.com`

Sign in with that email in Auth — the base migration backfills a `profiles` row for all existing `auth.users`.
