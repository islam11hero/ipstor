export type PendingDeposit = {
  id: string;
  user_id: string;
  amount: number;
  txid: string;
  created_at: string;
  user_email: string | null;
};

export type PendingOrder = {
  id: string;
  user_id: string;
  proxy_type: string;
  quantity: number;
  total_price: number;
  created_at: string;
};
