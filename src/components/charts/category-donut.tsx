"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { money, pct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Icon } from "../icon";
import { ChartTooltip } from "./chart-tooltip";

export interface DonutDatum {
  key: string;
  label: string;
  value: number;
  color: string;
  icono: string;
}

export function CategoryDonut({ data, total }: { data: DonutDatum[]; total: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const focused = data.find((d) => d.key === hover);
  const ranked = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="@container">
    <div className="flex flex-col items-center gap-6 @lg:flex-row @lg:items-center">
      <div className="relative size-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 1.5 : 0}
              cornerRadius={4}
              stroke="var(--surface)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={700}
              onMouseEnter={(_, i) => setHover(data[i]?.key ?? null)}
              onMouseLeave={() => setHover(null)}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} opacity={hover && hover !== d.key ? 0.35 : 1} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-muted">{focused ? focused.label : "Total gastado"}</span>
          <span className="tabular text-xl font-bold">{money(focused ? focused.value : total, { round: true })}</span>
          {focused && <span className="text-xs text-muted">{pct(focused.value / total)}</span>}
        </div>
      </div>

      {/* Leyenda = también es la vista de tabla (identidad nunca solo por color) */}
      <ul className="w-full min-w-0 flex-1 space-y-1">
        {ranked.map((d) => (
          <li
            key={d.key}
            onMouseEnter={() => setHover(d.key)}
            onMouseLeave={() => setHover(null)}
            className={cn("flex items-center gap-3 rounded-xl px-2 py-1.5 transition", hover === d.key && "bg-surface-2")}
          >
            <span className="flex size-7 items-center justify-center rounded-lg" style={{ color: d.color, background: `color-mix(in oklab, ${d.color} 14%, transparent)` }}>
              <Icon name={d.icono} size={14} />
            </span>
            <span className="flex-1 truncate text-sm text-ink-2">{d.label}</span>
            <span className="tabular w-12 text-right text-xs text-muted">{pct(d.value / total)}</span>
            <span className="tabular w-20 shrink-0 text-right text-sm font-semibold">{money(d.value, { round: true })}</span>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}
