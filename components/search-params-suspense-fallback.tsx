/** Shown while `useSearchParams()` boundaries resolve (Next.js CSR bailout / static shells). */
export function SearchParamsSuspenseFallback() {
  return (
    <div className="h-32 w-full animate-pulse rounded-xl bg-zinc-900/50" />
  );
}
