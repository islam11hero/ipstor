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

export type DashboardData = {
  email: string;
  balance: number;
  proxies: UserProxy[];
  deposits: UserDeposit[];
  isAdmin: boolean;
};
