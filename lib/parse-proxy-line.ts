/** Parse `host:port:user:pass` where host may be IPv4, bracketed IPv6, or hostname. */

export type ParsedProxyLine = {
  raw: string;
  host: string;
  port: string;
  username: string;
  password: string;
  /** True when host parses as IPv4 with valid octets. */
  ipv4Valid: boolean;
  /** True when host is bracketed IPv6 and passes a structural check. */
  ipv6Valid: boolean;
  /** Port is 1–65535. */
  portValid: boolean;
  /** Overall line matched expected colon structure. */
  formatOk: boolean;
};

const IPV4_PART = /^(\d{1,3})$/;

export function isValidIPv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  for (const p of parts) {
    if (!IPV4_PART.test(p)) return false;
    const n = Number(p);
    if (n < 0 || n > 255) return false;
    if (p.length > 1 && p.startsWith("0")) return false;
  }
  return true;
}

/** Simplified IPv6 validation: bracket content has only hex digits and colons, reasonable length. */
export function isPlausibleIPv6InsideBrackets(inner: string): boolean {
  if (inner.length < 2 || inner.length > 128) return false;
  if (!/^[0-9a-fA-F:]+$/.test(inner)) return false;
  const parts = inner.split(":").filter(Boolean);
  return parts.length >= 2 && parts.length <= 8;
}

function parseBracketedIpv6(line: string): ParsedProxyLine | null {
  if (!line.startsWith("[")) return null;
  const close = line.indexOf("]:");
  if (close <= 1) return null;
  const host = line.slice(1, close);
  const tail = line.slice(close + 2);
  const tailParts = splitUserPassPort(tail);
  if (!tailParts) return null;
  const { port, username, password } = tailParts;
  const ipv6Valid = isPlausibleIPv6InsideBrackets(host);
  const portValid = isValidPort(port);
  return {
    raw: line,
    host,
    port,
    username,
    password,
    ipv4Valid: false,
    ipv6Valid,
    portValid,
    formatOk: ipv6Valid && portValid,
  };
}

function splitUserPassPort(segment: string): {
  port: string;
  username: string;
  password: string;
} | null {
  const i1 = segment.indexOf(":");
  if (i1 <= 0) return null;
  const port = segment.slice(0, i1);
  const rest = segment.slice(i1 + 1);
  const i2 = rest.indexOf(":");
  if (i2 <= 0) return null;
  const username = rest.slice(0, i2);
  const password = rest.slice(i2 + 1);
  if (!username || password === "") return null;
  return { port, username, password };
}

function parseFromRightFourColons(line: string): ParsedProxyLine | null {
  const last = line.lastIndexOf(":");
  if (last <= 0) return null;
  const password = line.slice(last + 1);
  const a = line.slice(0, last);
  const last2 = a.lastIndexOf(":");
  if (last2 <= 0) return null;
  const username = a.slice(last2 + 1);
  const b = a.slice(0, last2);
  const last3 = b.lastIndexOf(":");
  if (last3 <= 0) return null;
  const port = b.slice(last3 + 1);
  const host = b.slice(0, last3);
  if (!host || !port || !username || password === "") return null;
  const ipv4Valid = isValidIPv4(host);
  const portValid = isValidPort(port);
  const ipv6Valid = false;
  return {
    raw: line,
    host,
    port,
    username,
    password,
    ipv4Valid,
    ipv6Valid,
    portValid,
    formatOk: portValid && (ipv4Valid || isHostname(host)),
  };
}

function isHostname(host: string): boolean {
  if (host.length < 1 || host.length > 253) return false;
  if (host.includes("..") || host.startsWith(".") || host.endsWith("."))
    return false;
  return /^[a-zA-Z0-9][-a-zA-Z0-9.]*[a-zA-Z0-9]$/.test(host) || /^[a-zA-Z0-9]+$/.test(host);
}

function isValidPort(port: string): boolean {
  if (!/^\d{1,5}$/.test(port)) return false;
  const n = Number(port);
  return n >= 1 && n <= 65535;
}

export function parseProxyLine(line: string): ParsedProxyLine {
  const trimmed = line.trim();
  if (!trimmed) {
    return {
      raw: line,
      host: "",
      port: "",
      username: "",
      password: "",
      ipv4Valid: false,
      ipv6Valid: false,
      portValid: false,
      formatOk: false,
    };
  }

  const v6 = parseBracketedIpv6(trimmed);
  if (v6) return v6;

  const v4 = parseFromRightFourColons(trimmed);
  if (v4) return v4;

  return {
    raw: line,
    host: "",
    port: "",
    username: "",
    password: "",
    ipv4Valid: false,
    ipv6Valid: false,
    portValid: false,
    formatOk: false,
  };
}
