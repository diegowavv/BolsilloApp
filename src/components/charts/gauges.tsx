"use client";

import { CheckCircle2, AlertTriangle, XCircle, CircleDashed } from "lucide-react";
import type { Health } from "@/lib/finance";

/** Medidor semicircular 0-100 para la salud financiera (estado con ícono + texto). */
export function HealthGauge({ health }: { health: Health }) {
  const { score, label } = health;
  const r = 80;
  const c = Math.PI * r;
  const color =
    label === "Sin datos" ? "var(--muted)" : score >= 60 ? "var(--good)" : score >= 40 ? "var(--warn)" : "var(--bad)";
  const StatusIcon = label === "Sin datos" ? CircleDashed : score >= 60 ? CheckCircle2 : score >= 40 ? AlertTriangle : XCircle;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 116" className="w-full max-w-[240px]" role="img" aria-label={`Salud financiera ${score} de 100: ${label}`}>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--surface-2)" strokeWidth={16} strokeLinecap="round" />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset 900ms ease-out" }}
        />
        <text x="100" y="90" textAnchor="middle" fontSize="38" fontWeight="700" fill="var(--ink)" className="tabular">
          {label === "Sin datos" ? "—" : score}
        </text>
        <text x="100" y="110" textAnchor="middle" fontSize="11" fill="var(--muted)">
          de 100
        </text>
      </svg>
      <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
        <StatusIcon size={16} /> {label}
      </span>
    </div>
  );
}

/** Anillo de progreso (metas de ahorro). */
export function ProgressRing({ value, size = 84, color = "var(--c-ahorro)", children }: { value: number; size?: number; color?: string; children?: React.ReactNode }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 900ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
