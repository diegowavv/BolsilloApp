import type { Plan } from "./types";

/**
 * Catálogo de funciones. Todo lo "premium" está preparado aquí para activarse
 * cuando exista un plan de pago; por ahora todos los usuarios son "free".
 */
export const FEATURES = {
  dashboard: { plan: "free", label: "Panel del mes con gráficas" },
  budgets: { plan: "free", label: "Presupuestos por categoría" },
  goals: { plan: "free", label: "Metas de ahorro" },
  export_csv: { plan: "free", label: "Exportar movimientos a CSV" },
  export_pdf: { plan: "premium", label: "Reportes mensuales en PDF" },
  shared_accounts: { plan: "premium", label: "Cuentas compartidas (pareja o familia)" },
  reminders: { plan: "premium", label: "Recordatorios de pagos y suscripciones" },
  ai_insights: { plan: "premium", label: "Consejos personalizados con IA" },
  bank_import: { plan: "premium", label: "Importar estados de cuenta" },
  multi_currency: { plan: "premium", label: "Varias monedas" },
} as const satisfies Record<string, { plan: Plan; label: string }>;

export type FeatureKey = keyof typeof FEATURES;

export function hasFeature(plan: Plan, feature: FeatureKey) {
  return FEATURES[feature].plan === "free" || plan === "premium";
}

export const PREMIUM_FEATURES = (Object.keys(FEATURES) as FeatureKey[]).filter(
  (k) => FEATURES[k].plan === "premium",
);
