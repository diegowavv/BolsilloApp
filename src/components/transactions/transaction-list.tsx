"use client";

import { Repeat } from "lucide-react";
import { clasificacionMeta, groupMeta } from "@/lib/categories";
import { capitalize, dayLabel, money } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { IconBubble } from "../icon";
import { useFinance } from "../providers/finance-provider";
import { Chip } from "../ui";

export function TransactionRow({ t }: { t: Transaction }) {
  const { categoryById, openQuickAdd } = useFinance();
  const cat = categoryById.get(t.category_id);
  const g = groupMeta(cat?.grupo ?? "otros");
  const clas = t.tipo === "gasto" ? (t.clasificacion ?? cat?.clasificacion_default) : null;
  const sign = t.tipo === "ingreso" ? "+" : "−";
  return (
    <button
      onClick={() => openQuickAdd(t)}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-surface-2"
    >
      <IconBubble name={cat?.icono ?? "shapes"} color={g.color} size={40} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium">
          {t.descripcion || cat?.nombre}
          {t.recurrente && <Repeat size={12} className="shrink-0 text-muted" aria-label="Recurrente" />}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="truncate text-xs text-muted">{cat?.nombre ?? "Sin categoría"}</span>
          {clas && <Chip color={clasificacionMeta(clas).color}>{clasificacionMeta(clas).label}</Chip>}
          {(t.tipo === "ahorro" || t.tipo === "inversion") && <Chip color="var(--c-ahorro)">{t.tipo === "ahorro" ? "Ahorro" : "Inversión"}</Chip>}
        </div>
      </div>
      <span className={"tabular shrink-0 text-sm font-semibold " + (t.tipo === "ingreso" ? "text-good" : "text-ink")}>
        {sign}
        {money(t.monto)}
      </span>
    </button>
  );
}

export function TransactionList({ items }: { items: Transaction[] }) {
  const groups = new Map<string, Transaction[]>();
  for (const t of items) groups.set(t.fecha, [...(groups.get(t.fecha) ?? []), t]);
  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([fecha, txs]) => {
        const net = txs.reduce((s, t) => s + (t.tipo === "ingreso" ? t.monto : -t.monto), 0);
        return (
          <section key={fecha}>
            <div className="flex items-center justify-between px-2 pb-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{capitalize(dayLabel(fecha))}</h3>
              <span className="tabular text-xs text-muted">{net >= 0 ? "+" : "−"}{money(Math.abs(net))}</span>
            </div>
            <div>
              {txs.map((t) => (
                <TransactionRow key={t.id} t={t} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
