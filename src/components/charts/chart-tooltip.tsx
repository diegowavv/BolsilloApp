"use client";

import { money } from "@/lib/format";

interface Item {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  payload?: { fill?: string; color?: string };
}

/** Tooltip común: texto en tintas neutras, el color solo en el marcador. */
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: {
  active?: boolean;
  payload?: readonly Item[];
  label?: string | number;
  labelFormatter?: (l: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-2xl border border-line bg-surface px-3 py-2.5 text-xs shadow-xl">
      {label != null && <p className="mb-1.5 font-semibold text-ink">{labelFormatter ? labelFormatter(String(label)) : label}</p>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span className="size-2 rounded-full" style={{ background: p.color ?? p.payload?.fill ?? p.payload?.color }} />
              {p.name}
            </span>
            <span className="tabular font-semibold text-ink">{money(Number(p.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
