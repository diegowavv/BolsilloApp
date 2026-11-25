"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthPoint } from "@/lib/finance";
import { capitalize, monthLabel, moneyCompact } from "@/lib/format";
import { ChartTooltip } from "./chart-tooltip";

const axis = { stroke: "var(--muted)", fontSize: 12, tickLine: false, axisLine: false } as const;

/** Dinero libre (disponible) por mes: una serie, el título la nombra. */
export function BalanceTrend({ data }: { data: MonthPoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="month" {...axis} tickFormatter={(m: string) => capitalize(monthLabel(m, "short").replace(".", ""))} />
          <YAxis {...axis} tickFormatter={moneyCompact} width={56} />
          <ReferenceLine y={0} stroke="var(--axis)" />
          <Tooltip
            cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
            content={<ChartTooltip labelFormatter={(m) => capitalize(monthLabel(m))} />}
          />
          <Area
            type="monotone"
            dataKey="disponible"
            name="Disponible"
            stroke="var(--brand)"
            strokeWidth={2}
            fill="url(#balanceFill)"
            dot={{ r: 4, fill: "var(--brand)", stroke: "var(--surface)", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "var(--brand)", stroke: "var(--surface)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
