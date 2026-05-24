export function DashboardLoading() {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:py-8"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="mb-6 h-9 w-48 rounded-lg bg-white/[0.06]" />
      <div className="flex gap-6">
        <div className="hidden h-[420px] w-56 rounded-2xl bg-white/[0.04] lg:block" />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="h-32 rounded-2xl bg-white/[0.04]" />
          <div className="h-48 rounded-2xl bg-white/[0.04]" />
          <div className="h-48 rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
