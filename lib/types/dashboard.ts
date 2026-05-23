export type UserProxy = {
  id: string;
  ip_address: string;
  port: string;
  username: string;
  password: string;
  created_at: string;
};

export type UserDeposit = {
  id: string;
  amount: number;
  txid: string;
  status: string;
  created_at: string;
};

export type UserOrder = {
  id: string;
  proxy_type: string;
  quantity: number;
  total_price: number;
  status: "pending" | "completed" | "cancelled" | string;
  created_at: string;
  tier_id?: string | null;
  addon_ids?: string[];
};

export type DashboardData = {
  email: string;
  balance: number;
  proxies: UserProxy[];
  deposits: UserDeposit[];
  orders: UserOrder[];
  isAdmin: boolean;
  /** Short code for affiliate referral URLs (`usr_<segment>`). */
  referralCode: string;
};
