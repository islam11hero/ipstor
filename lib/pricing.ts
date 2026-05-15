export const DATACENTER_PRICE_PER_IP = 1.5;
export const RESIDENTIAL_PRICE_PER_GB = 4.0;

export type ProxyProduct = "datacenter" | "residential";

export function calculateOrderTotal(
  proxyType: ProxyProduct,
  quantity: number
): number {
  const unit =
    proxyType === "datacenter"
      ? DATACENTER_PRICE_PER_IP
      : RESIDENTIAL_PRICE_PER_GB;
  return Math.round(unit * quantity * 100) / 100;
}

export const USDT_TRC20_ADDRESS =
  "TXk9mP2vQnR8wL4hY6jF3sD1cB0aZ7eU5xN2mK8pR4qW";
