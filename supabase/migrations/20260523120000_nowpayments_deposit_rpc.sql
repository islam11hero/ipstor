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
