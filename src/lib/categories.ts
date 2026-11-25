import type { Category, Clasificacion, GroupKey, TxType } from "./types";

export interface GroupMeta {
  key: GroupKey;
  label: string;
  /** Variable CSS del color (categoría fija; el color sigue a la entidad) */
  color: string;
  icono: string;
  tipo: TxType;
}

/**
 * Orden de los grupos de gasto = orden validado de la paleta categórica
 * (azul, naranja, aqua, amarillo, magenta, verde, violeta, rojo). Mantener
 * este orden para que los segmentos adyacentes se distingan con daltonismo.
 */
export const EXPENSE_GROUPS: GroupMeta[] = [
  { key: "vivienda", label: "Vivienda", color: "var(--s1)", icono: "home", tipo: "gasto" },
  { key: "restaurantes", label: "Restaurantes", color: "var(--s2)", icono: "utensils", tipo: "gasto" },
  { key: "alimentos", label: "Alimentos y súper", color: "var(--s3)", icono: "shopping-cart", tipo: "gasto" },
  { key: "delivery", label: "Delivery", color: "var(--s4)", icono: "bike", tipo: "gasto" },
  { key: "membresias", label: "Membresías", color: "var(--s5)", icono: "badge-check", tipo: "gasto" },
  { key: "servicios", label: "Servicios", color: "var(--s6)", icono: "zap", tipo: "gasto" },
  { key: "transporte", label: "Transporte", color: "var(--s7)", icono: "car", tipo: "gasto" },
  { key: "salud", label: "Salud", color: "var(--s8)", icono: "heart-pulse", tipo: "gasto" },
  { key: "otros", label: "Otros", color: "var(--s9)", icono: "shapes", tipo: "gasto" },
];

export const OTHER_GROUPS: GroupMeta[] = [
  { key: "ingresos", label: "Ingresos", color: "var(--c-ingreso)", icono: "wallet", tipo: "ingreso" },
  { key: "ahorro", label: "Ahorro", color: "var(--c-ahorro)", icono: "piggy-bank", tipo: "ahorro" },
  { key: "inversion", label: "Inversión", color: "var(--c-ahorro)", icono: "trending-up", tipo: "inversion" },
];

export const ALL_GROUPS = [...EXPENSE_GROUPS, ...OTHER_GROUPS];

export function groupMeta(key: GroupKey): GroupMeta {
  return ALL_GROUPS.find((g) => g.key === key) ?? EXPENSE_GROUPS[EXPENSE_GROUPS.length - 1];
}

export const CLASIFICACIONES: { key: Clasificacion; label: string; color: string; descripcion: string }[] = [
  { key: "necesario", label: "Necesario", color: "var(--c-necesario)", descripcion: "Lo indispensable: vivienda, comida, servicios, salud." },
  { key: "hormiga", label: "Hormiga", color: "var(--c-hormiga)", descripcion: "Pequeños gastos frecuentes que se acumulan sin notarlo." },
  { key: "innecesario", label: "Innecesario", color: "var(--c-innecesario)", descripcion: "Gustos y caprichos que podrías recortar." },
];

export function clasificacionMeta(key: Clasificacion) {
  return CLASIFICACIONES.find((c) => c.key === key)!;
}

export const TX_TYPES: { key: TxType; label: string; color: string }[] = [
  { key: "gasto", label: "Gasto", color: "var(--c-gasto)" },
  { key: "ingreso", label: "Ingreso", color: "var(--c-ingreso)" },
  { key: "ahorro", label: "Ahorro", color: "var(--c-ahorro)" },
  { key: "inversion", label: "Inversión", color: "var(--c-ahorro)" },
];

type Seed = [id: string, nombre: string, grupo: GroupKey, icono: string, tipo: TxType, clas: Clasificacion | null];

/** Categorías del sistema. Mismos IDs que en supabase/migrations/0002_seed.sql */
const SEED: Seed[] = [
  ["renta", "Renta / hipoteca", "vivienda", "home", "gasto", "necesario"],
  ["mantenimiento", "Mantenimiento del hogar", "vivienda", "wrench", "gasto", "necesario"],
  ["super", "Súper", "alimentos", "shopping-cart", "gasto", "necesario"],
  ["mercado", "Mercado / tiendita", "alimentos", "apple", "gasto", "necesario"],
  ["restaurantes", "Restaurantes", "restaurantes", "utensils", "gasto", "innecesario"],
  ["cafeterias", "Cafés y snacks", "restaurantes", "coffee", "gasto", "hormiga"],
  ["transporte-publico", "Transporte público", "transporte", "bus", "gasto", "necesario"],
  ["gasolina", "Gasolina / auto", "transporte", "fuel", "gasto", "necesario"],
  ["apps-transporte", "Uber / Didi / taxi", "transporte", "car-taxi-front", "gasto", "hormiga"],
  ["delivery", "Apps de delivery", "delivery", "bike", "gasto", "hormiga"],
  ["luz", "Luz", "servicios", "lightbulb", "gasto", "necesario"],
  ["agua", "Agua", "servicios", "droplet", "gasto", "necesario"],
  ["gas", "Gas", "servicios", "flame", "gasto", "necesario"],
  ["internet", "Internet", "servicios", "wifi", "gasto", "necesario"],
  ["telefono", "Teléfono celular", "servicios", "smartphone", "gasto", "necesario"],
  ["consultas", "Consultas médicas", "salud", "stethoscope", "gasto", "necesario"],
  ["medicinas", "Medicinas", "salud", "pill", "gasto", "necesario"],
  ["seguro-medico", "Seguro médico", "salud", "shield-plus", "gasto", "necesario"],
  ["gimnasio", "Gimnasio / fitness", "membresias", "dumbbell", "gasto", "innecesario"],
  ["club", "Club deportivo", "membresias", "trophy", "gasto", "innecesario"],
  ["streaming-video", "Streaming de video", "membresias", "tv", "gasto", "hormiga"],
  ["streaming-musica", "Streaming de música", "membresias", "music", "gasto", "hormiga"],
  ["ia", "Suscripciones de IA", "membresias", "sparkles", "gasto", "hormiga"],
  ["otras-digitales", "Otras suscripciones digitales", "membresias", "cloud", "gasto", "hormiga"],
  ["compras", "Compras y ropa", "otros", "shopping-bag", "gasto", "innecesario"],
  ["entretenimiento", "Entretenimiento", "otros", "ticket", "gasto", "innecesario"],
  ["educacion", "Educación", "otros", "graduation-cap", "gasto", "necesario"],
  ["otros-gastos", "Otros gastos", "otros", "shapes", "gasto", "innecesario"],
  ["sueldo", "Sueldo", "ingresos", "briefcase", "ingreso", null],
  ["freelance", "Freelance / extras", "ingresos", "laptop", "ingreso", null],
  ["otros-ingresos", "Otros ingresos", "ingresos", "wallet", "ingreso", null],
  ["ahorro", "Ahorro", "ahorro", "piggy-bank", "ahorro", null],
  ["fondo-emergencia", "Fondo de emergencia", "ahorro", "life-buoy", "ahorro", null],
  ["inversiones", "Inversiones", "inversion", "trending-up", "inversion", null],
];

export const SYSTEM_CATEGORIES: Category[] = SEED.map(([id, nombre, grupo, icono, tipo, clas]) => ({
  id,
  user_id: null,
  nombre,
  grupo,
  icono,
  tipo,
  clasificacion_default: clas,
}));
