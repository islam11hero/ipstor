import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function clientIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return null;
}

type IpApiPayload = {
  ip?: string;
  error?: boolean;
  reason?: string;
  city?: string | null;
  region?: string | null;
  country_name?: string | null;
  org?: string | null;
  asn?: string | number | null;
  timezone?: string | null;
};

export async function GET(request: Request) {
  const clientIp = clientIpFromRequest(request);
  if (!clientIp) {
    return NextResponse.json(
      { error: true, reason: "Could not determine client IP from headers." },
      { status: 400 }
    );
  }

  try {
    const target = encodeURIComponent(clientIp);
    const upstream = await fetch(`https://ipapi.co/${target}/json/`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const json = (await upstream.json()) as IpApiPayload;

    if (!upstream.ok || json.error) {
      return NextResponse.json(
        {
          error: true,
          reason:
            typeof json.reason === "string"
              ? json.reason
              : "Geo lookup failed.",
          ip: clientIp,
        },
        { status: upstream.ok ? 422 : upstream.status }
      );
    }

    return NextResponse.json(
      {
        ip: json.ip ?? clientIp,
        city: json.city ?? null,
        region: json.region ?? null,
        country_name: json.country_name ?? null,
        org: json.org ?? null,
        asn: json.asn ?? null,
        timezone: json.timezone ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: true, reason: "Upstream geo lookup unavailable." },
      { status: 502 }
    );
  }
}
