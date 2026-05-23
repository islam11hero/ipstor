# Supabase migrations

Apply `migrations/20260523120000_nowpayments_deposit_rpc.sql` in the Supabase SQL editor (or via `supabase db push`) before deploying the updated payment webhook.

It adds:

- `create_pending_crypto_deposit` — inserts/updates a `pending` deposit when checkout starts
- `complete_crypto_deposit` — atomically credits `profiles.balance` and marks the deposit `approved`

Both functions run as `SECURITY DEFINER` and are granted to `service_role` only.
