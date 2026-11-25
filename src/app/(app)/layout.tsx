import { AppShell } from "@/components/app-shell";
import { FinanceProvider } from "@/components/providers/finance-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <AppShell>{children}</AppShell>
    </FinanceProvider>
  );
}
