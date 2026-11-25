"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Bug, ChevronRight, PiggyBank, Plus, Sparkles, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { BalanceTrend } from "@/components/charts/balance-trend";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { CategoryDonut } from "@/components/charts/category-donut";
import { ClassificationBar } from "@/components/charts/classification-bar";
import { HealthGauge } from "@/components/charts/gauges";
import { IconBubble } from "@/components/icon";
import { MonthSwitcher } from "@/components/month-switcher";
import { useFinance } from "@/components/providers/finance-provider";
import { TransactionRow } from "@/components/transactions/transaction-list";
import { Button, Card, CardHeader, EmptyState, ProgressBar, Skeleton } from "@/components/ui";
import { groupMeta } from "@/lib/categories";
import {
  activeSubscriptions,
  budgetStatus,
  delta,
  groupBreakdown,
  healthScore,
  inMonth,
  monthlySeries,
  shiftMonth,
  summarize,
} from "@/lib/finance";
import { capitalize, money, monthLabel, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const f = useFinance();
  const { transactions, categories, month, budgets, loading, profile, categoryById } = f;

  const d = useMemo(() => {
    const txs = inMonth(transactions, month);
    const s = summarize(txs, categories);
    const prev = summarize(inMonth(transactions, shiftMonth(month, -1)), categories);
    return {
      txs,
      s,
      prev,
      series: monthlySeries(transactions, categories, month, 6),
      groups: groupBreakdown(s),
      health: healthScore(s),
      budgets: budgetStatus(budgets, s).sort((a, b) => b.ratio - a.ratio),
      subs: activeSubscriptions(transactions, month),
      topGastos: txs.filter((t) => t.tipo === "gasto").sort((a, b) => b.monto - a.monto).slice(0, 5),
    };
  }, [transactions, categories, month, budgets]);

  if (loading) return <DashboardSkeleton />;

  const { s, prev } = d;
  const hello = profile.nombre ? `Hola, ${profile.nombre.split(" ")[0]}` : "Hola 👋";
  const hasAny = transactions.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{hello}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Tu {capitalize(monthLabel(month).split(" ")[0])} en números</h1>
        </div>
        <MonthSwitcher />
      </div>

      {!hasAny ? (
        <Card>
          <EmptyState
            icon={<Sparkles size={26} />}
            title="Empecemos a ordenar tu dinero"
            text="Registra tu primer ingreso o gasto. Si prefieres explorar primero, carga unos datos de ejemplo y verás cómo se llenan las gráficas."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => f.openQuickAdd()}>
                  <Plus size={16} /> Agregar movimiento
                </Button>
                <Button variant="secondary" onClick={() => f.loadSampleData()}>
                  Cargar datos de ejemplo
                </Button>
              </div>
            }
          />
        </Card>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi label="Ingresos" value={s.ingresos} prev={prev.ingresos} icon={<Wallet size={16} />} color="var(--c-ingreso)" goodWhenUp />
        <Kpi label="Gastos" value={s.gastos} prev={prev.gastos} icon={<TrendingDown size={16} />} color="var(--c-gasto)" goodWhenUp={false} />
        <Kpi label="Ahorro e inversión" value={s.ahorro + s.inversion} prev={prev.ahorro + prev.inversion} icon={<PiggyBank size={16} />} color="var(--c-ahorro)" goodWhenUp sub={s.ingresos > 0 ? `${pct(s.tasaAhorro)} de tus ingresos` : undefined} />
        <Kpi label="Disponible" value={s.disponible} prev={prev.disponible} icon={<TrendingUp size={16} />} color="var(--brand)" goodWhenUp highlight />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="¿En qué se fue tu dinero?" subtitle="Gastos del mes por categoría" />
          {d.groups.length ? (
            <CategoryDonut data={d.groups.map((g) => ({ key: g.key, label: g.label, value: g.value, color: g.color, icono: g.icono }))} total={s.gastos} />
          ) : (
            <p className="py-10 text-center text-sm text-muted">Sin gastos registrados este mes.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Salud financiera" subtitle="Basada en la regla 50/30/20" />
          <HealthGauge health={d.health} />
          <ul className="mt-4 space-y-2">
            {d.health.tips.slice(0, 2).map((t) => (
              <li key={t} className="rounded-2xl bg-surface-2/70 px-3 py-2 text-[13px] text-ink-2">
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Necesario, hormiga o innecesario" subtitle="Cómo se reparten tus gastos del mes" />
        <ClassificationBar values={s.porClasificacion} ingresos={s.ingresos} />
        {s.porClasificacion.hormiga > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-hormiga/30 bg-hormiga/10 px-4 py-3 text-sm">
            <Bug size={18} className="mt-0.5 shrink-0 text-hormiga" />
            <p className="text-ink-2">
              Tus <b className="text-ink">gastos hormiga</b> suman <b className="text-ink">{money(s.porClasificacion.hormiga, { round: true })}</b>
              {s.ingresos > 0 && <> — el {pct(s.porClasificacion.hormiga / s.ingresos)} de tus ingresos</>}. Al año serían{" "}
              <b className="text-ink">{money(s.porClasificacion.hormiga * 12, { round: true })}</b>.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Ingresos vs gastos" subtitle="Últimos 6 meses" />
          <CashflowChart data={d.series} current={month} />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Dinero disponible" subtitle="Lo que te queda libre cada mes" />
          <BalanceTrend data={d.series} />
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Presupuestos" action={<SeeAll href="/presupuestos" />} />
          {d.budgets.length ? (
            <ul className="space-y-4">
              {d.budgets.slice(0, 4).map((b) => {
                const g = groupMeta(b.grupo);
                const color = b.estado === "excedido" ? "var(--bad)" : b.estado === "cerca" ? "var(--warn)" : "var(--good)";
                return (
                  <li key={b.grupo}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{g.label}</span>
                      <span className="tabular text-xs text-muted">
                        {money(b.gastado, { round: true })} / {money(b.limite, { round: true })}
                      </span>
                    </div>
                    <ProgressBar value={b.ratio} color={color} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <MiniEmpty text="Define límites por categoría para no pasarte." href="/presupuestos" cta="Crear presupuesto" />
          )}
        </Card>

        <Card>
          <CardHeader title="Suscripciones activas" subtitle={d.subs.length ? `${money(d.subs.reduce((a, x) => a + x.monto, 0), { round: true })} al mes` : undefined} action={<SeeAll href="/suscripciones" />} />
          {d.subs.length ? (
            <ul className="space-y-1">
              {d.subs.slice(0, 5).map((x) => {
                const cat = categoryById.get(x.category_id);
                return (
                  <li key={x.key} className="flex items-center gap-3 py-1.5">
                    <IconBubble name={cat?.icono ?? "repeat"} color={groupMeta(cat?.grupo ?? "otros").color} size={32} />
                    <span className="flex-1 truncate text-sm">{x.descripcion}</span>
                    <span className="tabular text-sm font-semibold">{money(x.monto, { round: true })}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <MiniEmpty text="Marca tus gastos como “se repite cada mes” para verlos aquí." href="/suscripciones" cta="Ver suscripciones" />
          )}
        </Card>

        <Card>
          <CardHeader title="Gastos más grandes" action={<SeeAll href="/movimientos" />} />
          {d.topGastos.length ? (
            <div className="-mx-2">
              {d.topGastos.map((t) => (
                <TransactionRow key={t.id} t={t} />
              ))}
            </div>
          ) : (
            <MiniEmpty text="Aquí verás tus 5 gastos más grandes del mes." />
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  prev,
  icon,
  color,
  goodWhenUp,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  prev: number;
  icon: React.ReactNode;
  color: string;
  goodWhenUp: boolean;
  sub?: string;
  highlight?: boolean;
}) {
  const dlt = delta(value, prev);
  const up = (dlt ?? 0) >= 0;
  const good = up === goodWhenUp;
  return (
    <Card className={cn("animate-fade-up p-4 sm:p-5", highlight && "bg-brand text-brand-ink [&_*]:!text-current")}>
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
        <span className="flex size-7 items-center justify-center rounded-full" style={{ color: highlight ? undefined : color, background: highlight ? "rgba(255,255,255,.18)" : `color-mix(in oklab, ${color} 14%, transparent)` }}>
          {icon}
        </span>
        {label}
      </div>
      <p className="tabular mt-3 text-xl font-bold tracking-tight sm:text-2xl">{money(value, { round: true })}</p>
      <div className="mt-1 min-h-4 text-xs">
        {sub ? (
          <span className="text-muted">{sub}</span>
        ) : dlt != null ? (
          <span className={cn("inline-flex items-center gap-0.5 font-medium", highlight ? "" : good ? "text-good" : "text-bad")}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {pct(Math.abs(dlt))} <span className="font-normal text-muted">vs mes anterior</span>
          </span>
        ) : (
          <span className="text-muted">Sin datos del mes anterior</span>
        )}
      </div>
    </Card>
  );
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs font-medium text-brand hover:underline">
      Ver todo <ChevronRight size={14} />
    </Link>
  );
}

function MiniEmpty({ text, href, cta }: { text: string; href?: string; cta?: string }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-muted">{text}</p>
      {href && cta && (
        <Link href={href} className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
          {cta}
        </Link>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-12 w-72" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
