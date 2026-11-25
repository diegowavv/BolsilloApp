import { SYSTEM_CATEGORIES } from "./categories";
import { shiftMonth } from "./finance";
import type { Goal, GroupKey, NewTransaction } from "./types";

/** Pseudoaleatorio determinista para que los datos de ejemplo sean estables */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

type Item = [categoryId: string, descripcion: string, min: number, max: number, timesPerMonth: number, recurrente?: boolean];

const ITEMS: Item[] = [
  ["renta", "Renta departamento", 9500, 9500, 1, true],
  ["super", "Súper semanal", 850, 1400, 4],
  ["mercado", "Tiendita", 60, 180, 5],
  ["restaurantes", "Comida fuera", 280, 750, 3],
  ["cafeterias", "Café", 55, 95, 9],
  ["transporte-publico", "Metro / Metrobús", 50, 100, 4],
  ["apps-transporte", "Uber", 85, 240, 5],
  ["apps-transporte", "Didi", 70, 180, 3],
  ["delivery", "Rappi", 160, 380, 3],
  ["delivery", "Uber Eats", 150, 320, 2],
  ["luz", "CFE", 380, 620, 1, true],
  ["agua", "Agua", 180, 260, 1, true],
  ["gas", "Gas", 420, 560, 1, true],
  ["internet", "Internet hogar", 499, 499, 1, true],
  ["telefono", "Plan celular", 349, 349, 1, true],
  ["medicinas", "Farmacia", 120, 450, 1],
  ["gimnasio", "Gimnasio", 699, 699, 1, true],
  ["streaming-video", "Netflix", 299, 299, 1, true],
  ["streaming-video", "Disney+", 219, 219, 1, true],
  ["streaming-musica", "Spotify", 129, 129, 1, true],
  ["ia", "Asistente de IA", 400, 400, 1, true],
  ["compras", "Ropa", 400, 1200, 1],
  ["entretenimiento", "Cine", 180, 320, 1],
];

export function sampleTransactions(endMonth: string, months = 4): NewTransaction[] {
  const rand = rng(42);
  const catById = new Map(SYSTEM_CATEGORIES.map((c) => [c.id, c]));
  const out: NewTransaction[] = [];
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  for (let i = months - 1; i >= 0; i--) {
    const mk = shiftMonth(endMonth, -i);
    const [y, m] = mk.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const day = (d: number) => `${mk}-${String(Math.min(lastDay, Math.max(1, d))).padStart(2, "0")}`;
    const push = (category_id: string, descripcion: string, monto: number, fecha: string, recurrente = false) => {
      if (fecha > todayISO) return; // no generamos movimientos en el futuro
      const cat = catById.get(category_id)!;
      out.push({ category_id, tipo: cat.tipo, monto: Math.round(monto), fecha, descripcion, clasificacion: null, metodo_pago: null, recurrente });
    };

    push("sueldo", "Quincena", 17500, day(1), true);
    push("sueldo", "Quincena", 17500, day(15), true);
    if (rand() > 0.5) push("freelance", "Proyecto freelance", 2500 + rand() * 4000, day(10 + Math.floor(rand() * 15)));

    for (const [cid, desc, min, max, times, rec] of ITEMS) {
      for (let k = 0; k < times; k++) {
        const d = rec ? 3 + (desc.length % 20) : 1 + Math.floor(rand() * lastDay);
        push(cid, desc, min + rand() * (max - min), day(d), rec ?? false);
      }
    }

    push("ahorro", "Ahorro quincenal", 2500, day(2), true);
    push("fondo-emergencia", "Fondo de emergencia", 1000, day(16), true);
    push("inversiones", "CETES", 1500, day(16), true);
  }
  return out;
}

export const SAMPLE_BUDGETS: [GroupKey, number][] = [
  ["restaurantes", 2500],
  ["delivery", 1200],
  ["transporte", 2200],
  ["membresias", 2000],
  ["alimentos", 5500],
];

export const SAMPLE_GOALS: Omit<Goal, "id">[] = [
  { nombre: "Fondo de emergencia", objetivo: 60000, actual: 21500, fecha_limite: null, icono: "life-buoy" },
  { nombre: "Viaje a la playa", objetivo: 18000, actual: 7200, fecha_limite: null, icono: "plane" },
];
