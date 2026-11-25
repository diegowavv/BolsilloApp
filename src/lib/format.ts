import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const mxnRound = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 });

export function money(n: number, opts: { round?: boolean } = {}) {
  return (opts.round ? mxnRound : mxn).format(n || 0);
}

export function moneyCompact(n: number) {
  return "$" + compact.format(n || 0);
}

export function pct(n: number, digits = 0) {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

/** "2026-11" -> "noviembre 2026" */
export function monthLabel(monthKey: string, style: "long" | "short" = "long") {
  const d = parseISO(`${monthKey}-01`);
  return format(d, style === "long" ? "MMMM yyyy" : "MMM", { locale: es });
}

export function dayLabel(fecha: string) {
  return format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es });
}

export function shortDate(fecha: string) {
  return format(parseISO(fecha), "d MMM yyyy", { locale: es });
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
