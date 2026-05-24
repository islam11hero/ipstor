export function AdminLoading() {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse px-6 py-12"
      aria-busy="true"
      aria-label="Loading admin panel"
    >
      <div className="mb-8 h-10 w-72 rounded-lg bg-white/[0.06]" />
      <div className="flex gap-6">
        <div className="hidden h-[360px] w-56 rounded-2xl bg-white/[0.04] lg:block" />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-2xl bg-white/[0.04]" />
            <div className="h-24 rounded-2xl bg-white/[0.04]" />
            <div className="h-24 rounded-2xl bg-white/[0.04]" />
          </div>
          <div className="h-64 rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
