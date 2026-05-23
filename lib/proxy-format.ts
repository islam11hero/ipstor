import { parseProxyLine } from "@/lib/parse-proxy-line";
import type { UserProxy } from "@/lib/types/dashboard";

export type ParsedProxyCredential = {
  ip_address: string;
  port: string;
  username: string;
  password: string;
};

export function parseProxyLinesFromText(raw: string): {
  credentials: ParsedProxyCredential[];
  invalidLines: string[];
} {
  const credentials: ParsedProxyCredential[] = [];
  const invalidLines: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parsed = parseProxyLine(trimmed);
    if (!parsed.formatOk) {
      invalidLines.push(trimmed);
      continue;
    }
    credentials.push({
      ip_address: parsed.host,
      port: parsed.port,
      username: parsed.username,
      password: parsed.password,
    });
  }

  return { credentials, invalidLines };
}

export function formatProxyLine(proxy: UserProxy): string {
  return `${proxy.ip_address}:${proxy.port}:${proxy.username}:${proxy.password}`;
}

export function formatProxyList(proxies: UserProxy[]): string {
  return proxies.map(formatProxyLine).join("\n");
}
