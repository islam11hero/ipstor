-- IP Nova base schema (run in Supabase SQL Editor before the NowPayments RPC migration).
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.

-- ─── profiles ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  balance numeric(12, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS balance numeric(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ─── orders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  proxy_type text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price numeric(12, 2) NOT NULL CHECK (total_price >= 0),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- ─── user_proxies ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_proxies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders (id) ON DELETE SET NULL,
  ip_address text NOT NULL,
  port text NOT NULL,
  username text NOT NULL DEFAULT '',
  password text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_proxies
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS port text,
  ADD COLUMN IF NOT EXISTS username text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS password text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Legacy installs sometimes used proxy_user / proxy_pass
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_proxies'
      AND column_name = 'proxy_user'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_proxies'
      AND column_name = 'username'
  ) THEN
    ALTER TABLE public.user_proxies RENAME COLUMN proxy_user TO username;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_proxies'
      AND column_name = 'proxy_pass'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_proxies'
      AND column_name = 'password'
  ) THEN
    ALTER TABLE public.user_proxies RENAME COLUMN proxy_pass TO password;
  END IF;
END $$;

-- ─── deposits ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  txid text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT deposits_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE UNIQUE INDEX IF NOT EXISTS deposits_txid_key ON public.deposits (txid);

CREATE INDEX IF NOT EXISTS deposits_user_id_idx ON public.deposits (user_id);
CREATE INDEX IF NOT EXISTS orders_user_id_status_idx ON public.orders (user_id, status);
CREATE INDEX IF NOT EXISTS user_proxies_user_id_idx ON public.user_proxies (user_id);

-- ─── auto profile on signup + backfill existing users ───────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, balance)
  VALUES (NEW.id, NEW.email, 0)
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(EXCLUDED.email, public.profiles.email),
      updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, balance)
SELECT u.id, u.email, 0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS orders_insert_own ON public.orders;
CREATE POLICY orders_insert_own ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_proxies_select_own ON public.user_proxies;
CREATE POLICY user_proxies_select_own ON public.user_proxies
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS deposits_select_own ON public.deposits;
CREATE POLICY deposits_select_own ON public.deposits
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Service role bypasses RLS for admin + webhooks (use SUPABASE_SERVICE_ROLE_KEY server-side).
-- Atomic NowPayments deposit flows (run in Supabase SQL editor or via CLI).
-- Requires: public.profiles (id, balance), public.deposits (user_id, amount, txid, status).

CREATE UNIQUE INDEX IF NOT EXISTS deposits_txid_key ON public.deposits (txid);

CREATE OR REPLACE FUNCTION public.create_pending_crypto_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_txid text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount numeric;
  v_deposit_id uuid;
  v_existing deposits%ROWTYPE;
BEGIN
  v_amount := round(p_amount::numeric, 2);
  IF v_amount <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT';
  END IF;

  IF p_txid IS NULL OR length(trim(p_txid)) = 0 THEN
    RAISE EXCEPTION 'INVALID_TXID';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  SELECT * INTO v_existing FROM deposits WHERE txid = p_txid;

  IF FOUND THEN
    IF v_existing.status = 'approved' THEN
      RETURN jsonb_build_object('status', 'already_approved', 'deposit_id', v_existing.id);
    END IF;
    IF v_existing.user_id <> p_user_id THEN
      RAISE EXCEPTION 'TXID_USER_MISMATCH';
    END IF;
    UPDATE deposits
    SET amount = v_amount, status = 'pending'
    WHERE id = v_existing.id
    RETURNING id INTO v_deposit_id;
    RETURN jsonb_build_object('status', 'updated', 'deposit_id', v_deposit_id);
  END IF;

  INSERT INTO deposits (user_id, amount, txid, status)
  VALUES (p_user_id, v_amount, p_txid, 'pending')
  RETURNING id INTO v_deposit_id;

  RETURN jsonb_build_object('status', 'created', 'deposit_id', v_deposit_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_crypto_deposit(
  p_user_id uuid,
  p_canonical_txid text,
  p_credit_amount numeric,
  p_match_txids text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_deposit deposits%ROWTYPE;
  v_credit numeric;
  v_new_balance numeric;
BEGIN
  v_credit := round(p_credit_amount::numeric, 2);
  IF v_credit <= 0 THEN
    RAISE EXCEPTION 'INVALID_CREDIT_AMOUNT';
  END IF;

  IF p_canonical_txid IS NULL OR length(trim(p_canonical_txid)) = 0 THEN
    RAISE EXCEPTION 'INVALID_TXID';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM deposits d
    WHERE d.user_id = p_user_id
      AND d.status = 'approved'
      AND (
        d.txid = p_canonical_txid
        OR (p_match_txids IS NOT NULL AND d.txid = ANY (p_match_txids))
      )
  ) THEN
    RETURN jsonb_build_object('status', 'idempotent');
  END IF;

  SELECT * INTO v_deposit
  FROM deposits d
  WHERE d.user_id = p_user_id
    AND d.status = 'pending'
    AND (
      d.txid = p_canonical_txid
      OR (p_match_txids IS NOT NULL AND d.txid = ANY (p_match_txids))
    )
  ORDER BY d.created_at DESC
  LIMIT 1
  FOR UPDATE;

  v_new_balance := round(COALESCE(v_profile.balance, 0) + v_credit, 2);

  IF FOUND THEN
    UPDATE profiles SET balance = v_new_balance WHERE id = p_user_id;
    UPDATE deposits
    SET status = 'approved', amount = v_credit, txid = p_canonical_txid
    WHERE id = v_deposit.id;
    RETURN jsonb_build_object(
      'status',
      'completed',
      'deposit_id',
      v_deposit.id,
      'from_pending',
      true
    );
  END IF;

  IF EXISTS (SELECT 1 FROM deposits WHERE txid = p_canonical_txid) THEN
    RETURN jsonb_build_object('status', 'duplicate');
  END IF;

  UPDATE profiles SET balance = v_new_balance WHERE id = p_user_id;
  INSERT INTO deposits (user_id, amount, txid, status)
  VALUES (p_user_id, v_credit, p_canonical_txid, 'approved');

  RETURN jsonb_build_object('status', 'completed', 'from_pending', false);
END;
$$;

REVOKE ALL ON FUNCTION public.create_pending_crypto_deposit(uuid, numeric, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_crypto_deposit(uuid, text, numeric, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_pending_crypto_deposit(uuid, numeric, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_crypto_deposit(uuid, text, numeric, text[]) TO service_role;
