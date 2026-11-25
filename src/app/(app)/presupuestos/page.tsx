"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Gauge, Pencil, Trash2, XCircle } from "lucide-react";
import { IconBubble } from "@/components/icon";
import { MonthSwitcher } from "@/components/month-switcher";
import { useFinance } from "@/components/providers/finance-provider";
import { Button, Card, EmptyState, Field, Input, Modal, PageHeader, ProgressBar, Select } from "@/components/ui";
import { EXPENSE_GROUPS, groupMeta } from "@/lib/categories";
import { budgetStatus, inMonth, summarize } from "@/lib/finance";
import { money, pct } from "@/lib/format";
import type { GroupKey } from "@/lib/types";

const ESTADO = {
  ok: { label: "En rango", color: "var(--good)", icon: CheckCircle2 },
  cerca: { label: "Cerca del límite", color: "var(--warn)", icon: AlertTriangle },
  excedido: { label: "Excedido", color: "var(--bad)", icon: XCircle },
} as const;

export default function PresupuestosPage() {
  const { transactions, categories, budgets, month, setBudget, deleteBudget } = useFinance();
  const [editing, setEditing] = useState<{ grupo: GroupKey | ""; monto: string } | null>(null);

  const s = useMemo(() => summarize(inMonth(transactions, month), categories), [transactions, categories, month]);
  const status = budgetStatus(budgets, s).sort((a, b) => b.ratio - a.ratio);
  const totalLimite = status.reduce((a, b) => a + b.limite, 0);
  const totalGastado = status.reduce((a, b) => a + b.gastado, 0);
  const sinPresupuesto = EXPENSE_GROUPS.filter((g) => !budgets.some((b) => b.grupo === g.key));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.grupo) return;
    const monto = Number(editing.monto);
    if (!(monto > 0)) return;
    await setBudget(editing.grupo, monto);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Presupuestos"
        subtitle="Límites mensuales por categoría. Se reinician cada mes."
        action={
          <div className="flex flex-wrap gap-3">
            <MonthSwitcher />
            <Button onClick={() => setEditing({ grupo: sinPresupuesto[0]?.key ?? "", monto: "" })} disabled={!sinPresupuesto.length}>
              Nuevo presupuesto
            </Button>
          </div>
        }
      />

      {status.length > 0 && (
        <Card className="mb-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Gastado en categorías con presupuesto</p>
              <p className="tabular mt-1 text-2xl font-bold">
                {money(totalGastado, { round: true })} <span className="text-base font-medium text-muted">de {money(totalLimite, { round: true })}</span>
              </p>
            </div>
            <p className="text-sm font-medium text-ink-2">{pct(totalLimite ? totalGastado / totalLimite : 0)} usado</p>
          </div>
          <ProgressBar className="mt-4 h-3" value={totalLimite ? totalGastado / totalLimite : 0} color={totalGastado > totalLimite ? "var(--bad)" : "var(--brand)"} />
        </Card>
      )}

      {status.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {status.map((b) => {
            const g = groupMeta(b.grupo);
            const e = ESTADO[b.estado];
            const restante = b.limite - b.gastado;
            const budget = budgets.find((x) => x.grupo === b.grupo)!;
            return (
              <Card key={b.grupo} className="animate-fade-up">
                <div className="flex items-start gap-3">
                  <IconBubble name={g.icono} color={g.color} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{g.label}</p>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium" style={{ color: e.color }}>
                      <e.icon size={13} /> {e.label}
                    </span>
                  </div>
                  <button onClick={() => setEditing({ grupo: b.grupo, monto: String(b.limite) })} className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Editar">
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => confirm(`¿Eliminar el presupuesto de ${g.label}?`) && deleteBudget(budget.id)}
                    className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-bad"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="tabular mt-4 text-xl font-bold">
                  {money(b.gastado, { round: true })} <span className="text-sm font-medium text-muted">/ {money(b.limite, { round: true })}</span>
                </p>
                <ProgressBar className="mt-3" value={b.ratio} color={e.color} />
                <p className="mt-2 text-xs text-muted">
                  {restante >= 0 ? <>Te quedan <b className="text-ink-2">{money(restante, { round: true })}</b></> : <>Te pasaste por <b className="text-bad">{money(-restante, { round: true })}</b></>}
                </p>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Gauge size={24} />}
            title="Aún no tienes presupuestos"
            text="Ponle un tope mensual a restaurantes, delivery o transporte por app, y te avisaremos cuando estés cerca del límite."
            action={<Button onClick={() => setEditing({ grupo: "restaurantes", monto: "" })}>Crear mi primer presupuesto</Button>}
          />
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Presupuesto mensual">
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <Field label="Categoría">
              <Select value={editing.grupo} onChange={(e) => setEditing({ ...editing, grupo: e.target.value as GroupKey })}>
                {EXPENSE_GROUPS.filter((g) => g.key === editing.grupo || !budgets.some((b) => b.grupo === g.key)).map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Límite al mes (MXN)" hint={editing.grupo ? `Este mes llevas ${money(s.porGrupo[editing.grupo] ?? 0)} en esta categoría.` : undefined}>
              <Input type="number" min="1" step="any" inputMode="decimal" autoFocus value={editing.monto} onChange={(e) => setEditing({ ...editing, monto: e.target.value })} placeholder="2500" required />
            </Field>
            <Button type="submit" className="w-full">
              Guardar
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
