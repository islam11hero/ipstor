import { ToolsShell } from "@/components/tools/tools-shell";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolsShell>{children}</ToolsShell>;
}
