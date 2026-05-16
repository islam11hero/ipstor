"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseProxyLine } from "@/lib/parse-proxy-line";
import { cn } from "@/lib/utils";

const glassPanel =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

export function ProxyTesterClient() {
  const [input, setInput] = useState("");

  const rows = useMemo(() => {
    return input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 100)
      .map((line) => {
        const parsed = parseProxyLine(line);
        const ipOk = parsed.ipv4Valid || parsed.ipv6Valid;
        const valid = parsed.formatOk && ipOk;
        return { line, parsed, valid, ipOk };
      });
  }, [input]);

  const stats = useMemo(() => {
    const ok = rows.filter((r) => r.valid).length;
    return { ok, bad: rows.length - ok };
  }, [rows]);

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(34,211,238,0.08),transparent)]"
        aria-hidden
      />
      <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-cyan-500/90 uppercase">
        <ListChecks className="size-3.5" aria-hidden />
        Free tool
      </div>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Proxy format validator
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
        Parse up to 100 lines in{" "}
        <code className="rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-xs text-emerald-200/90">
          IP:PORT:USER:PASS
        </code>{" "}
        (IPv4, bracketed IPv6, or hostname). We validate structure and IPv4
        octet math instantly—no network probes, no fake ping numbers.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={cn(glassPanel, "p-4 sm:p-5")}>
          <label
            htmlFor="proxy-input"
            className="text-xs font-semibold tracking-wider text-zinc-500 uppercase"
          >
            Paste proxy lines
          </label>
          <textarea
            id="proxy-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`198.51.100.2:8000:user:pass\n[2001:db8::1]:3128:operator:secret`}
            rows={14}
            className="mt-3 w-full resize-y rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 font-mono text-[13px] leading-relaxed text-zinc-200 outline-none ring-emerald-500/30 placeholder:text-zinc-600 focus:border-emerald-500/35 focus:ring-2 sm:text-sm"
            spellCheck={false}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <span>
              Lines: <span className="text-zinc-300">{rows.length}</span> / 100
            </span>
            <span>
              Valid IPv4/IPv6 structure:{" "}
              <span className="text-emerald-400/90">{stats.ok}</span> · Invalid:{" "}
              <span className="text-red-400/90">{stats.bad}</span>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-white/12 text-zinc-300 hover:bg-white/[0.05]"
            onClick={() => setInput("")}
          >
            Clear
          </Button>
        </div>

        <div className={cn(glassPanel, "min-h-[280px] p-4 sm:p-5 lg:min-h-[420px]")}>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Parsed endpoints
            </span>
          </div>
          <div className="mt-3 max-h-[min(70vh,520px)] overflow-auto">
            {rows.length === 0 ? (
              <p className="text-sm text-zinc-600">
                Parsed rows render here as you type. Invalid lines stay visible so
                you can fix delimiter mistakes quickly.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-10 text-center">OK</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Password</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow
                      key={`${i}-${r.line.slice(0, 48)}`}
                      className="border-white/[0.06] hover:bg-white/[0.02]"
                    >
                      <TableCell className="text-center align-middle">
                        {r.valid ? (
                          <CheckCircle2
                            className="mx-auto size-4 text-emerald-400"
                            aria-label="Valid"
                          />
                        ) : (
                          <XCircle
                            className="mx-auto size-4 text-red-400/90"
                            aria-label="Invalid"
                          />
                        )}
                      </TableCell>
                      <TableCell className="max-w-[180px] break-all font-mono text-xs text-zinc-200">
                        {r.parsed.host || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-300">
                        {r.parsed.port || "—"}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate font-mono text-xs text-zinc-300">
                        {r.parsed.username || "—"}
                      </TableCell>
                      <TableCell className="max-w-[140px] break-all font-mono text-xs text-zinc-400">
                        {r.parsed.password || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
