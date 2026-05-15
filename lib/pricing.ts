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
