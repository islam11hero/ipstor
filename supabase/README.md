# Supabase migrations

Run these **in order** in the Supabase Dashboard → **SQL Editor** (or `supabase db push`):

1. `migrations/20260523090000_base_schema.sql` — tables (`profiles`, `orders`, `user_proxies`, `deposits`), RLS, signup trigger, backfill for existing users
2. `migrations/20260523120000_nowpayments_deposit_rpc.sql` — crypto deposit RPC functions

If the dashboard shows errors like *column user_proxies.username does not exist* or *table public.deposits not found*, step **1** was not applied yet.

After step 1, existing logins get a `profiles` row automatically; new signups get one via trigger.

Step 2 adds:

- `create_pending_crypto_deposit` — inserts/updates a `pending` deposit when checkout starts
- `complete_crypto_deposit` — atomically credits `profiles.balance` and marks the deposit `approved`

Both RPC functions run as `SECURITY DEFINER` and are granted to `service_role` only.
