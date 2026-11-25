"use client";

import { useMemo, useState } from "react";
import { PiggyBank, Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { ProgressRing } from "@/components/charts/gauges";
import { Icon } from "@/components/icon";
import { useFinance } from "@/components/providers/finance-provider";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Button, Card, CardHeader, EmptyState, Field, Input, Modal, PageHeader, Select } from "@/components/ui";
import { currentMonthKey, monthKeyOf, shiftMonth } from "@/lib/finance";
import { capitalize, money, monthLabel, moneyCompact, pct, shortDate } from "@/lib/format";
import type { Goal } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const GOAL_ICONS = ["target", "life-buoy", "plane", "home", "car", "graduation-cap", "laptop", "heart-pulse", "sparkles"];

export default function AhorroPage() {
  const { transactions, goals, addGoal, updateGoal, deleteGoal, addTransactions } = useFinance();
  const [newGoal, setNewGoal] = useState(false);
  const [deposit, setDeposit] = useState<Goal | null>(null);

  const savingsTxs = useMemo(() => transactions.filter((t) => t.tipo === "ahorro" || t.tipo === "inversion"), [transactions]);
  const totalAhorro = savingsTxs.filter((t) => t.tipo === "ahorro").reduce((a, t) => a + t.monto, 0);
  const totalInversion = savingsTxs.filter((t) => t.tipo === "inversion").reduce((a, t) => a + t.monto, 0);

  // Acumulado de los últimos 12 meses
  const series = useMemo(() => {
    const end = currentMonthKey();
    const start = shiftMonth(end, -11);
    return Array.from({ length: 12 }, (_, i) => {
      const m = shiftMonth(start, i);
      const total = savingsTxs.filter((t) => monthKeyOf(t.fecha) <= m).reduce((a, t) => a + t.monto, 0);
      return { month: m, total: Math.round(total) };
    });
  }, [savingsTxs]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ahorro e inversión"
        subtitle="Tus metas y todo lo que has apartado para tu futuro."
        action={
          <Button onClick={() => setNewGoal(true)}>
            <Plus size={16} /> Nueva meta
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total acumulado" value={totalAhorro + totalInversion} icon={<PiggyBank size={16} />} />
        <Stat label="En ahorro" value={totalAhorro} icon={<Target size={16} />} />
        <Stat label="En inversión" value={totalInversion} icon={<TrendingUp size={16} />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Cómo crece tu patrimonio" subtitle="Ahorro + inversión acumulados, últimos 12 meses" />
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="savFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--c-ahorro)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--c-ahorro)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--grid)" />
                <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(m: string) => capitalize(monthLabel(m, "short").replace(".", ""))} />
                <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={moneyCompact} width={56} />
                <Tooltip cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }} content={<ChartTooltip labelFormatter={(m) => capitalize(monthLabel(m))} />} />
                <Area type="monotone" dataKey="total" name="Acumulado" stroke="var(--c-ahorro)" strokeWidth={2} fill="url(#savFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Metas de ahorro" />
          {goals.length ? (
            <ul className="space-y-4">
              {goals.map((g) => {
                const p = g.objetivo ? g.actual / g.objetivo : 0;
                return (
                  <li key={g.id} className="flex items-center gap-4">
                    <ProgressRing value={p} size={72}>
                      <span className="text-xs font-bold">{pct(Math.min(1, p))}</span>
                    </ProgressRing>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate font-semibold">
                        <Icon name={g.icono} size={15} className="text-ahorro" /> {g.nombre}
                      </p>
                      <p className="tabular text-sm text-ink-2">
                        {money(g.actual, { round: true })} <span className="text-muted">de {money(g.objetivo, { round: true })}</span>
                      </p>
                      {g.fecha_limite && <p className="text-xs text-muted">Para el {shortDate(g.fecha_limite)}</p>}
                      <div className="mt-1.5 flex gap-2">
                        <button onClick={() => setDeposit(g)} className="text-xs font-semibold text-brand hover:underline">
                          + Abonar
                        </button>
                        <button onClick={() => confirm(`¿Eliminar la meta "${g.nombre}"?`) && deleteGoal(g.id)} className="text-xs text-muted hover:text-bad" aria-label="Eliminar meta">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<Target size={24} />} title="Sin metas todavía" text="Un fondo de emergencia de 3 a 6 meses de gastos es un gran primer objetivo." action={<Button size="sm" onClick={() => setNewGoal(true)}>Crear meta</Button>} />
          )}
        </Card>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="px-2 pt-1">
          <CardHeader title="Movimientos de ahorro e inversión" />
        </div>
        {savingsTxs.length ? (
          <TransactionList items={savingsTxs.slice(0, 30)} />
        ) : (
          <p className="py-8 text-center text-sm text-muted">Registra un movimiento de tipo “Ahorro” o “Inversión” para verlo aquí.</p>
        )}
      </Card>

      <Modal open={newGoal} onClose={() => setNewGoal(false)} title="Nueva meta de ahorro">
        {newGoal && (
          <GoalForm
            onSubmit={async (g) => {
              await addGoal(g);
              setNewGoal(false);
            }}
          />
        )}
      </Modal>

      <Modal open={!!deposit} onClose={() => setDeposit(null)} title={`Abonar a “${deposit?.nombre ?? ""}”`}>
        {deposit && (
          <DepositForm
            onSubmit={async (monto, registrar) => {
              await updateGoal(deposit.id, { actual: Math.round((deposit.actual + monto) * 100) / 100 });
              if (registrar) {
                await addTransactions([
                  { tipo: "ahorro", category_id: "ahorro", monto, fecha: todayISO(), descripcion: `Abono: ${deposit.nombre}`, clasificacion: null, metodo_pago: null, recurrente: false },
                ]);
              }
              setDeposit(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-ahorro/15 text-ahorro">{icon}</span>
        {label}
      </div>
      <p className="tabular mt-2 text-2xl font-bold">{money(value, { round: true })}</p>
    </Card>
  );
}

function GoalForm({ onSubmit }: { onSubmit: (g: Omit<Goal, "id">) => Promise<void> }) {
  const [nombre, setNombre] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [actual, setActual] = useState("");
  const [fecha, setFecha] = useState("");
  const [icono, setIcono] = useState("target");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!nombre.trim() || !(Number(objetivo) > 0)) return;
        await onSubmit({ nombre: nombre.trim(), objetivo: Number(objetivo), actual: Number(actual) || 0, fecha_limite: fecha || null, icono });
      }}
      className="space-y-4"
    >
      <Field label="Nombre">
        <Input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Fondo de emergencia" required maxLength={60} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Objetivo (MXN)">
          <Input type="number" min="1" step="any" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="50000" required />
        </Field>
        <Field label="Ya tengo (MXN)">
          <Input type="number" min="0" step="any" value={actual} onChange={(e) => setActual(e.target.value)} placeholder="0" />
        </Field>
      </div>
      <Field label="Fecha límite (opcional)">
        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </Field>
      <div>
        <p className="mb-2 text-[13px] font-medium text-ink-2">Ícono</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_ICONS.map((i) => (
            <button
              type="button"
              key={i}
              onClick={() => setIcono(i)}
              className={"flex size-10 items-center justify-center rounded-xl border transition " + (icono === i ? "border-ahorro bg-ahorro/15 text-ahorro" : "border-line text-ink-2 hover:bg-surface-2")}
              aria-label={i}
            >
              <Icon name={i} />
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        Crear meta
      </Button>
    </form>
  );
}

function DepositForm({ onSubmit }: { onSubmit: (monto: number, registrar: boolean) => Promise<void> }) {
  const [monto, setMonto] = useState("");
  const [registrar, setRegistrar] = useState("si");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const n = Number(monto);
        if (n > 0) await onSubmit(n, registrar === "si");
      }}
      className="space-y-4"
    >
      <Field label="Monto (MXN)">
        <Input type="number" min="1" step="any" autoFocus value={monto} onChange={(e) => setMonto(e.target.value)} required />
      </Field>
      <Field label="¿Registrar también como movimiento de ahorro de hoy?">
        <Select value={registrar} onChange={(e) => setRegistrar(e.target.value)}>
          <option value="si">Sí, que cuente en mi mes</option>
          <option value="no">No, solo actualizar la meta</option>
        </Select>
      </Field>
      <Button type="submit" className="w-full">
        Abonar
      </Button>
    </form>
  );
}
