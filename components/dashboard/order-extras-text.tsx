import { describeOrderExtras } from "@/lib/product-catalog";

type OrderExtrasTextProps = {
  proxyType: string;
  tierId?: string | null;
  addonIds?: string[];
};

export function OrderExtrasText({
  proxyType,
  tierId,
  addonIds,
}: OrderExtrasTextProps) {
  const extras = describeOrderExtras(proxyType, tierId, addonIds);
  if (!extras) return null;
  return <p className="mt-1 text-xs text-zinc-500">{extras}</p>;
}
