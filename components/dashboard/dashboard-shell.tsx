"use client";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return <div className="animate-in fade-in duration-300">{children}</div>;
}
