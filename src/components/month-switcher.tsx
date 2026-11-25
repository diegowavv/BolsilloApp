"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { currentMonthKey, shiftMonth } from "@/lib/finance";
import { capitalize, monthLabel } from "@/lib/format";
import { useFinance } from "./providers/finance-provider";

export function MonthSwitcher() {
  const { month, setMonth } = useFinance();
  const isCurrent = month === currentMonthKey();
  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-card">
      <button onClick={() => setMonth(shiftMonth(month, -1))} className="rounded-full p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink" aria-label="Mes anterior">
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => setMonth(currentMonthKey())}
        className="min-w-[140px] px-2 text-center text-sm font-semibold"
        title={isCurrent ? undefined : "Volver al mes actual"}
      >
        {capitalize(monthLabel(month))}
      </button>
      <button onClick={() => setMonth(shiftMonth(month, 1))} className="rounded-full p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink" aria-label="Mes siguiente">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
