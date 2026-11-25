"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthPoint } from "@/lib/finance";
import { capitalize, monthLabel, moneyCompact } from "@/lib/format";
import { ChartTooltip } from "./chart-tooltip";

const axis = { stroke: "var(--muted)", fontSize: 12, tickLine: false, axisLine: false } as const;

/** Ingresos vs gastos de los últimos meses (barras agrupadas, un solo eje). */
export function CashflowChart({ data, current }: { data: MonthPoint[]; current: string }) {
  return (
    <div>
      <Legend
        items={[
          { label: "Ingresos", color: "var(--c-ingreso)" },
          { label: "Gastos", color: "var(--c-gasto)" },
          { label: "Ahorro e inversión", color: "var(--c-ahorro)" },
        ]}
      />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="22%" margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis
              dataKey="month"
              {...axis}
              tickFormatter={(m: string) => capitalize(monthLabel(m, "short").replace(".", ""))}
              tick={({ x, y, payload }) => (
                <text x={x} y={Number(y) + 14} textAnchor="middle" fontSize={12} fill={payload.value === current ? "var(--ink)" : "var(--muted)"} fontWeight={payload.value === current ? 600 : 400}>
                  {capitalize(monthLabel(payload.value, "short").replace(".", ""))}
                </text>
              )}
            />
            <YAxis {...axis} tickFormatter={moneyCompact} width={56} />
            <Tooltip cursor={{ fill: "var(--surface-2)", radius: 12 }} content={<ChartTooltip labelFormatter={(m) => capitalize(monthLabel(m))} />} />
            <Bar dataKey="ingresos" name="Ingresos" fill="var(--c-ingreso)" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="gastos" name="Gastos" fill="var(--c-gasto)" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="ahorro" name="Ahorro e inversión" fill="var(--c-ahorro)" radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5 text-xs text-ink-2">
          <span className="size-2.5 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
