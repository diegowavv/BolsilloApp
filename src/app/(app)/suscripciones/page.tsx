"use client";

import { useMemo, useState } from "react";
import { CopyPlus, Repeat } from "lucide-react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { IconBubble } from "@/components/icon";
import { MonthSwitcher } from "@/components/month-switcher";
import { useFinance } from "@/components/providers/finance-provider";
import { Button, Card, CardHeader, Chip, EmptyState, PageHeader } from "@/components/ui";
import { clasificacionMeta, groupMeta } from "@/lib/categories";
import { activeSubscriptions, pendingRecurring, sameDayIn, shiftMonth } from "@/lib/finance";
import { capitalize, money, monthLabel, shortDate } from "@/lib/format";

export default function SuscripcionesPage() {
  const { transactions, categoryById, month, addTransactions, openQuickAdd } = useFinance();
  const [copying, setCopying] = useState(false);

  const subs = useMemo(() => activeSubscriptions(transactions, month), [transactions, month]);
  const pending = useMemo(() => pendingRecurring(transactions, month), [transactions, month]);
  const mensual = subs.reduce((a, s) => a + s.monto, 0);
  const digitales = subs.filter((s) => categoryById.get(s.category_id)?.grupo === "membresias");

  const chartData = subs.slice(0, 8).map((s) => {
    const cat = categoryById.get(s.category_id);
    return { name: s.descripcion, value: s.monto, fill: groupMeta(cat?.grupo ?? "otros").color };
  });

  const copyPending = async () => {
    setCopying(true);
    try {
      await addTransactions(
        pending.map((t) => ({
          tipo: t.tipo,
          category_id: t.category_id,
          monto: t.monto,
          fecha: sameDayIn(t.fecha, month),
          descripcion: t.descripcion,
          clasificacion: t.clasificacion,
          metodo_pago: t.metodo_pago,
          recurrente: true,
        })),
      );
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Suscripciones y pagos fijos" subtitle="Todo lo marcado como “se repite cada mes”." action={<MonthSwitcher />} />

      {pending.length > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-brand/30 bg-brand-soft/50">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-brand text-brand-ink">
              <CopyPlus size={18} />
            </span>
            <div>
              <p className="font-semibold">
                {pending.length} movimiento{pending.length === 1 ? "" : "s"} recurrente{pending.length === 1 ? "" : "s"} de {capitalize(monthLabel(shiftMonth(month, -1)))}
              </p>
              <p className="text-sm text-ink-2">Cópialos a {capitalize(monthLabel(month))} con un clic (sueldo, renta, servicios, suscripciones…).</p>
            </div>
          </div>
          <Button onClick={copyPending} disabled={copying}>
            {copying ? "Copiando…" : "Copiar al mes"}
          </Button>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-[13px] font-medium text-ink-2">Pagos fijos al mes</p>
          <p className="tabular mt-2 text-2xl font-bold">{money(mensual, { round: true })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[13px] font-medium text-ink-2">Al año</p>
          <p className="tabular mt-2 text-2xl font-bold">{money(mensual * 12, { round: true })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[13px] font-medium text-ink-2">Membresías (digitales y físicas)</p>
          <p className="tabular mt-2 text-2xl font-bold">
            {money(digitales.reduce((a, s) => a + s.monto, 0), { round: true })}
            <span className="ml-1 text-sm font-medium text-muted">/ mes</span>
          </p>
        </Card>
      </div>

      {subs.length ? (
        <div className="grid gap-5 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <CardHeader title="Las que más pesan" subtitle="Costo mensual" />
            <div style={{ height: Math.max(160, chartData.length * 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap={8}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} fontSize={12} stroke="var(--ink-2)" />
                  <Tooltip cursor={{ fill: "var(--surface-2)" }} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Al mes" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {chartData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                    <LabelList dataKey="value" position="right" fontSize={11} fill="var(--ink-2)" formatter={(v) => money(Number(v), { round: true })} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="xl:col-span-3">
            <CardHeader title="Detalle" />
            <ul className="divide-y divide-line">
              {subs.map((s) => {
                const cat = categoryById.get(s.category_id);
                const g = groupMeta(cat?.grupo ?? "otros");
                const clas = cat?.clasificacion_default;
                const tx = transactions.find((t) => t.fecha === s.ultimaFecha && t.category_id === s.category_id && t.descripcion === s.descripcion);
                return (
                  <li key={s.key}>
                    <button onClick={() => tx && openQuickAdd(tx)} className="flex w-full items-center gap-3 py-3 text-left">
                      <IconBubble name={cat?.icono ?? "shapes"} color={g.color} size={38} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.descripcion}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                          {cat?.nombre} · último pago {shortDate(s.ultimaFecha)}
                          {clas && <Chip color={clasificacionMeta(clas).color}>{clasificacionMeta(clas).label}</Chip>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="tabular text-sm font-semibold">{money(s.monto)}</p>
                        <p className="tabular text-[11px] text-muted">{money(s.monto * 12, { round: true })}/año</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Repeat size={24} />}
            title="Sin pagos recurrentes"
            text="Al agregar un gasto como Netflix, Spotify, el gimnasio o la renta, activa “Se repite cada mes” y aparecerá aquí."
            action={<Button onClick={() => openQuickAdd()}>Agregar suscripción</Button>}
          />
        </Card>
      )}
    </div>
  );
}
