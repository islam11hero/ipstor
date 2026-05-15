import type { UserProxy } from "@/lib/types/dashboard";

export function formatProxyLine(proxy: UserProxy): string {
  return `${proxy.ip_address}:${proxy.port}:${proxy.username}:${proxy.password}`;
}

export function formatProxyList(proxies: UserProxy[]): string {
  return proxies.map(formatProxyLine).join("\n");
}
