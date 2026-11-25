export type TxType = "ingreso" | "gasto" | "ahorro" | "inversion";
export type Clasificacion = "necesario" | "hormiga" | "innecesario";

export type GroupKey =
  | "vivienda"
  | "restaurantes"
  | "alimentos"
  | "delivery"
  | "membresias"
  | "servicios"
  | "transporte"
  | "salud"
  | "otros"
  | "ingresos"
  | "ahorro"
  | "inversion";

export interface Category {
  id: string;
  user_id: string | null;
  nombre: string;
  grupo: GroupKey;
  icono: string;
  tipo: TxType;
  clasificacion_default: Clasificacion | null;
}

export interface Transaction {
  id: string;
  category_id: string;
  tipo: TxType;
  monto: number;
  /** YYYY-MM-DD */
  fecha: string;
  descripcion: string;
  clasificacion: Clasificacion | null;
  metodo_pago: string | null;
  recurrente: boolean;
  created_at?: string;
}

export type NewTransaction = Omit<Transaction, "id" | "created_at">;

export interface Budget {
  id: string;
  grupo: GroupKey;
  monto: number;
}

export interface Goal {
  id: string;
  nombre: string;
  objetivo: number;
  actual: number;
  fecha_limite: string | null;
  icono: string;
}

export type Plan = "free" | "premium";

export interface Profile {
  id: string;
  nombre: string | null;
  email: string | null;
  moneda: string;
  plan: Plan;
}
