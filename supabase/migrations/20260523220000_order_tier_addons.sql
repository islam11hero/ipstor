-- Optional tier + add-on metadata on orders (product page upsells).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tier_id text,
  ADD COLUMN IF NOT EXISTS addons_json jsonb NOT NULL DEFAULT '[]'::jsonb;
