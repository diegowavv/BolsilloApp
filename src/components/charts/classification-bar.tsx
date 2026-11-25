"use client";

import { CLASIFICACIONES } from "@/lib/categories";
import { money, pct } from "@/lib/format";
import type { Clasificacion } from "@/lib/types";

/** Barra 100% apilada Necesario / Hormiga / Innecesario, con etiquetas directas. */
export function ClassificationBar({ values, ingresos }: { values: Record<Clasificacion, number>; ingresos: number }) {
  const total = values.necesario + values.hormiga + values.innecesario;
  return (
    <div>
      <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full bg-surface-2">
        {total > 0 &&
          CLASIFICACIONES.map((c) =>
            values[c.key] > 0 ? (
              <div
                key={c.key}
                title={`${c.label}: ${money(values[c.key])} (${pct(values[c.key] / total)})`}
                className="h-full transition-[width] duration-700 ease-out first:rounded-l-full last:rounded-r-full"
                style={{ width: `${(values[c.key] / total) * 100}%`, background: c.color }}
              />
            ) : null,
          )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {CLASIFICACIONES.map((c) => (
          <div key={c.key} className="rounded-2xl bg-surface-2/60 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-2">
              <span className="size-2.5 rounded-full" style={{ background: c.color }} />
              {c.label}
            </div>
            <p className="tabular mt-1.5 text-base font-bold sm:text-lg">{money(values[c.key], { round: true })}</p>
            <p className="text-[11px] text-muted">
              {total > 0 ? pct(values[c.key] / total) : "0%"} del gasto
              {ingresos > 0 && <span className="hidden sm:inline"> · {pct(values[c.key] / ingresos)} del ingreso</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
