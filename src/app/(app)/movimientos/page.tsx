"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search, ArrowLeftRight } from "lucide-react";
import { MonthSwitcher } from "@/components/month-switcher";
import { useFinance } from "@/components/providers/finance-provider";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Button, Card, EmptyState, Input, PageHeader, Segmented, Select, Skeleton } from "@/components/ui";
import { CLASIFICACIONES, EXPENSE_GROUPS, groupMeta } from "@/lib/categories";
import { inMonth, summarize } from "@/lib/finance";
import { money } from "@/lib/format";
import type { Clasificacion, GroupKey, TxType } from "@/lib/types";

type TipoFilter = "todos" | TxType;

export default function MovimientosPage() {
  const { transactions, categories, categoryById, month, loading, openQuickAdd } = useFinance();
  const [tipo, setTipo] = useState<TipoFilter>("todos");
  const [clas, setClas] = useState<"" | Clasificacion>("");
  const [grupo, setGrupo] = useState<"" | GroupKey>("");
  const [q, setQ] = useState("");

  const monthTxs = useMemo(() => inMonth(transactions, month), [transactions, month]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return monthTxs.filter((t) => {
      const cat = categoryById.get(t.category_id);
      if (tipo !== "todos" && t.tipo !== tipo) return false;
      if (clas && (t.tipo !== "gasto" || (t.clasificacion ?? cat?.clasificacion_default) !== clas)) return false;
      if (grupo && cat?.grupo !== grupo) return false;
      if (needle && !`${t.descripcion} ${cat?.nombre ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [monthTxs, tipo, clas, grupo, q, categoryById]);

  const s = summarize(filtered, categories);

  const exportCsv = () => {
    const header = ["fecha", "tipo", "categoria", "grupo", "clasificacion", "descripcion", "monto", "metodo_pago", "recurrente"];
    const rows = filtered.map((t) => {
      const cat = categoryById.get(t.category_id);
      return [
        t.fecha,
        t.tipo,
        cat?.nombre ?? "",
        cat ? groupMeta(cat.grupo).label : "",
        t.tipo === "gasto" ? (t.clasificacion ?? cat?.clasificacion_default ?? "") : "",
        t.descripcion,
        t.monto.toFixed(2),
        t.metodo_pago ?? "",
        t.recurrente ? "si" : "no",
      ];
    });
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `movimientos-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Movimientos" subtitle="Toca un movimiento para editarlo o eliminarlo." action={<MonthSwitcher />} />

      <Card className="mb-5 space-y-3 p-4">
        <Segmented
          value={tipo}
          onChange={(v) => {
            setTipo(v);
            if (v !== "gasto" && v !== "todos") setClas("");
          }}
          options={[
            { value: "todos", label: "Todos" },
            { value: "gasto", label: "Gastos", color: "var(--c-gasto)" },
            { value: "ingreso", label: "Ingresos", color: "var(--c-ingreso)" },
            { value: "ahorro", label: "Ahorro", color: "var(--c-ahorro)" },
            { value: "inversion", label: "Inversión", color: "var(--c-ahorro)" },
          ]}
          className="overflow-x-auto"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
          </div>
          <Select value={grupo} onChange={(e) => setGrupo(e.target.value as GroupKey | "")} aria-label="Categoría">
            <option value="">Todas las categorías</option>
            {EXPENSE_GROUPS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </Select>
          <Select value={clas} onChange={(e) => setClas(e.target.value as Clasificacion | "")} aria-label="Clasificación">
            <option value="">Cualquier clasificación</option>
            {CLASIFICACIONES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-muted">
            {filtered.length} movimiento{filtered.length === 1 ? "" : "s"}
          </span>
          {s.ingresos > 0 && <span className="tabular font-medium text-good">+{money(s.ingresos)}</span>}
          {s.gastos > 0 && <span className="tabular font-medium">−{money(s.gastos)}</span>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!filtered.length}>
            <Download size={15} /> CSV
          </Button>
          <Button size="sm" onClick={() => openQuickAdd()}>
            <Plus size={15} /> Nuevo
          </Button>
        </div>
      </div>

      <Card className="p-3 sm:p-4">
        {loading ? (
          <div className="space-y-3 p-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : filtered.length ? (
          <TransactionList items={filtered} />
        ) : (
          <EmptyState
            icon={<ArrowLeftRight size={24} />}
            title={monthTxs.length ? "Nada coincide con los filtros" : "Sin movimientos este mes"}
            text={monthTxs.length ? "Prueba con otros filtros o limpia la búsqueda." : "Agrega tu primer ingreso o gasto del mes."}
            action={!monthTxs.length && <Button onClick={() => openQuickAdd()}>Agregar movimiento</Button>}
          />
        )}
      </Card>
    </div>
  );
}
