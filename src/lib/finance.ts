import { EXPENSE_GROUPS } from "./categories";
import type { Budget, Category, Clasificacion, GroupKey, Transaction } from "./types";

/** "2026-11-05" -> "2026-11" */
export function monthKeyOf(fecha: string) {
  return fecha.slice(0, 7);
}

export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Suma (o resta) meses a una clave "YYYY-MM" */
export function shiftMonth(monthKey: string, delta: number) {
  const [y, m] = monthKey.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

export function inMonth(txs: Transaction[], monthKey: string) {
  return txs.filter((t) => monthKeyOf(t.fecha) === monthKey);
}

export interface MonthSummary {
  ingresos: number;
  gastos: number;
  ahorro: number;
  inversion: number;
  /** ingresos - gastos - ahorro - inversión: lo que queda libre */
  disponible: number;
  /** (ahorro + inversión) / ingresos */
  tasaAhorro: number;
  porClasificacion: Record<Clasificacion, number>;
  porGrupo: Partial<Record<GroupKey, number>>;
  porCategoria: Record<string, number>;
  count: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function summarize(txs: Transaction[], categories: Category[]): MonthSummary {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const s: MonthSummary = {
    ingresos: 0,
    gastos: 0,
    ahorro: 0,
    inversion: 0,
    disponible: 0,
    tasaAhorro: 0,
    porClasificacion: { necesario: 0, hormiga: 0, innecesario: 0 },
    porGrupo: {},
    porCategoria: {},
    count: txs.length,
  };

  for (const t of txs) {
    const monto = Number(t.monto) || 0;
    if (t.tipo === "ingreso") s.ingresos += monto;
    else if (t.tipo === "ahorro") s.ahorro += monto;
    else if (t.tipo === "inversion") s.inversion += monto;
    else {
      s.gastos += monto;
      const cat = catById.get(t.category_id);
      const clas = t.clasificacion ?? cat?.clasificacion_default ?? "innecesario";
      s.porClasificacion[clas] += monto;
      const grupo = cat?.grupo ?? "otros";
      s.porGrupo[grupo] = (s.porGrupo[grupo] ?? 0) + monto;
      s.porCategoria[t.category_id] = (s.porCategoria[t.category_id] ?? 0) + monto;
    }
  }

  s.ingresos = round2(s.ingresos);
  s.gastos = round2(s.gastos);
  s.ahorro = round2(s.ahorro);
  s.inversion = round2(s.inversion);
  s.disponible = round2(s.ingresos - s.gastos - s.ahorro - s.inversion);
  s.tasaAhorro = s.ingresos > 0 ? (s.ahorro + s.inversion) / s.ingresos : 0;
  return s;
}

/** Variación relativa entre dos valores; null si no hay base para comparar */
export function delta(actual: number, anterior: number): number | null {
  if (!anterior) return null;
  return (actual - anterior) / anterior;
}

export interface MonthPoint {
  month: string;
  ingresos: number;
  gastos: number;
  ahorro: number;
  disponible: number;
}

/** Serie de los últimos `n` meses terminando en `endMonth` (incluido) */
export function monthlySeries(txs: Transaction[], categories: Category[], endMonth: string, n = 6): MonthPoint[] {
  const out: MonthPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const month = shiftMonth(endMonth, -i);
    const s = summarize(inMonth(txs, month), categories);
    out.push({ month, ingresos: s.ingresos, gastos: s.gastos, ahorro: s.ahorro + s.inversion, disponible: s.disponible });
  }
  return out;
}

/** Gastos agrupados en el orden fijo de la paleta (el color sigue al grupo) */
export function groupBreakdown(summary: MonthSummary) {
  return EXPENSE_GROUPS.map((g) => ({ ...g, value: round2(summary.porGrupo[g.key] ?? 0) })).filter((g) => g.value > 0);
}

export interface Health {
  score: number;
  label: "Excelente" | "Buena" | "Regular" | "En riesgo" | "Sin datos";
  tips: string[];
}

/**
 * Salud financiera 0-100, inspirada en la regla 50/30/20:
 * - 40 pts: ahorrar/invertir al menos 20% de los ingresos
 * - 30 pts: gastos necesarios <= 50% de los ingresos (0 pts al llegar a 80%)
 * - 30 pts: hormiga + innecesario <= 30% de los ingresos (0 pts al llegar a 60%)
 * Si se gasta más de lo que entra, se descuentan puntos.
 */
export function healthScore(s: MonthSummary): Health {
  if (s.ingresos <= 0) {
    return { score: 0, label: "Sin datos", tips: ["Registra tus ingresos del mes para calcular tu salud financiera."] };
  }
  const tips: string[] = [];
  const ratioAhorro = (s.ahorro + s.inversion + Math.max(0, s.disponible)) / s.ingresos;
  const ratioNecesario = s.porClasificacion.necesario / s.ingresos;
  const ratioPrescindible = (s.porClasificacion.hormiga + s.porClasificacion.innecesario) / s.ingresos;

  const ptsAhorro = 40 * Math.min(1, Math.max(0, ratioAhorro) / 0.2);
  const ptsNecesario = 30 * clamp01(1 - Math.max(0, ratioNecesario - 0.5) / 0.3);
  const ptsPrescindible = 30 * clamp01(1 - Math.max(0, ratioPrescindible - 0.3) / 0.3);
  let score = ptsAhorro + ptsNecesario + ptsPrescindible;
  if (s.disponible < 0) score -= Math.min(30, (-s.disponible / s.ingresos) * 100);
  score = Math.round(Math.max(0, Math.min(100, score)));

  if (ratioAhorro < 0.2) tips.push("Intenta apartar al menos el 20% de tus ingresos para ahorro o inversión.");
  if (ratioNecesario > 0.5) tips.push("Tus gastos necesarios superan el 50% de tus ingresos; revisa renta y servicios.");
  if (ratioPrescindible > 0.3) tips.push("Los gastos hormiga e innecesarios pasan del 30%; ahí hay margen para recortar.");
  if (s.disponible < 0) tips.push("Este mes gastaste más de lo que ingresaste.");
  if (!tips.length) tips.push("¡Vas muy bien! Mantén este ritmo y considera aumentar tu inversión.");

  const label = score >= 80 ? "Excelente" : score >= 60 ? "Buena" : score >= 40 ? "Regular" : "En riesgo";
  return { score, label, tips };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export interface BudgetStatus {
  grupo: GroupKey;
  limite: number;
  gastado: number;
  ratio: number;
  estado: "ok" | "cerca" | "excedido";
}

export function budgetStatus(budgets: Budget[], s: MonthSummary): BudgetStatus[] {
  return budgets.map((b) => {
    const gastado = s.porGrupo[b.grupo] ?? 0;
    const ratio = b.monto > 0 ? gastado / b.monto : 0;
    return {
      grupo: b.grupo,
      limite: b.monto,
      gastado,
      ratio,
      estado: ratio > 1 ? "excedido" : ratio >= 0.8 ? "cerca" : "ok",
    };
  });
}

export interface Subscription {
  key: string;
  descripcion: string;
  category_id: string;
  monto: number;
  ultimaFecha: string;
}

/**
 * Suscripciones = gastos recurrentes. Se toma la ocurrencia más reciente de
 * cada (categoría + descripción) en los últimos 2 meses respecto a `monthKey`.
 */
export function activeSubscriptions(txs: Transaction[], monthKey: string): Subscription[] {
  const desde = shiftMonth(monthKey, -1);
  const map = new Map<string, Subscription>();
  for (const t of txs) {
    if (t.tipo !== "gasto" || !t.recurrente) continue;
    const mk = monthKeyOf(t.fecha);
    if (mk < desde || mk > monthKey) continue;
    const key = `${t.category_id}|${t.descripcion.trim().toLowerCase()}`;
    const prev = map.get(key);
    if (!prev || t.fecha > prev.ultimaFecha) {
      map.set(key, { key, descripcion: t.descripcion, category_id: t.category_id, monto: Number(t.monto), ultimaFecha: t.fecha });
    }
  }
  return [...map.values()].sort((a, b) => b.monto - a.monto);
}

/** Movimientos recurrentes del mes anterior que aún no existen en `monthKey` */
export function pendingRecurring(txs: Transaction[], monthKey: string): Transaction[] {
  const prev = inMonth(txs, shiftMonth(monthKey, -1)).filter((t) => t.recurrente);
  const current = new Set(
    inMonth(txs, monthKey).map((t) => `${t.category_id}|${t.descripcion.trim().toLowerCase()}`),
  );
  return prev.filter((t) => !current.has(`${t.category_id}|${t.descripcion.trim().toLowerCase()}`));
}

/** Mueve una fecha al mismo día en otro mes (ajustando fin de mes) */
export function sameDayIn(fecha: string, monthKey: string) {
  const day = Number(fecha.slice(8, 10));
  const [y, m] = monthKey.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${monthKey}-${String(Math.min(day, last)).padStart(2, "0")}`;
}
