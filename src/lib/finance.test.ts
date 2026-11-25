import { describe, expect, it } from "vitest";
import { SYSTEM_CATEGORIES } from "./categories";
import {
  activeSubscriptions,
  budgetStatus,
  delta,
  groupBreakdown,
  healthScore,
  inMonth,
  monthlySeries,
  pendingRecurring,
  sameDayIn,
  shiftMonth,
  summarize,
} from "./finance";
import type { Transaction } from "./types";

let n = 0;
function tx(p: Partial<Transaction> & Pick<Transaction, "category_id" | "monto">): Transaction {
  const cat = SYSTEM_CATEGORIES.find((c) => c.id === p.category_id)!;
  return {
    id: String(++n),
    tipo: cat.tipo,
    fecha: "2026-11-10",
    descripcion: cat.nombre,
    clasificacion: null,
    metodo_pago: null,
    recurrente: false,
    ...p,
  };
}

const cats = SYSTEM_CATEGORIES;

describe("shiftMonth", () => {
  it("cruza años en ambos sentidos", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-11", -13)).toBe("2025-10");
  });
});

describe("summarize", () => {
  const txs = [
    tx({ category_id: "sueldo", monto: 30000 }),
    tx({ category_id: "renta", monto: 9000 }),
    tx({ category_id: "super", monto: 4000 }),
    tx({ category_id: "delivery", monto: 1200 }),
    tx({ category_id: "streaming-video", monto: 300 }),
    tx({ category_id: "restaurantes", monto: 1500 }),
    tx({ category_id: "restaurantes", monto: 500, clasificacion: "necesario" }),
    tx({ category_id: "ahorro", monto: 3000 }),
    tx({ category_id: "inversiones", monto: 2000 }),
  ];
  const s = summarize(txs, cats);

  it("separa ingresos, gastos, ahorro e inversión", () => {
    expect(s.ingresos).toBe(30000);
    expect(s.gastos).toBe(16500);
    expect(s.ahorro).toBe(3000);
    expect(s.inversion).toBe(2000);
    expect(s.disponible).toBe(8500);
    expect(s.tasaAhorro).toBeCloseTo(5000 / 30000);
  });

  it("usa la clasificación del movimiento o la de su categoría", () => {
    expect(s.porClasificacion).toEqual({ necesario: 13500, hormiga: 1500, innecesario: 1500 });
  });

  it("agrupa por grupo en el orden fijo de la paleta", () => {
    expect(s.porGrupo.restaurantes).toBe(2000);
    expect(groupBreakdown(s).map((g) => g.key)).toEqual(["vivienda", "restaurantes", "alimentos", "delivery", "membresias"]);
  });
});

describe("inMonth y monthlySeries", () => {
  const txs = [
    tx({ category_id: "sueldo", monto: 100, fecha: "2026-10-01" }),
    tx({ category_id: "sueldo", monto: 200, fecha: "2026-11-30" }),
    tx({ category_id: "super", monto: 50, fecha: "2026-11-02" }),
  ];
  it("filtra por mes", () => {
    expect(inMonth(txs, "2026-11")).toHaveLength(2);
  });
  it("genera n meses terminando en el mes elegido", () => {
    const serie = monthlySeries(txs, cats, "2026-11", 3);
    expect(serie.map((p) => p.month)).toEqual(["2026-09", "2026-10", "2026-11"]);
    expect(serie[2]).toMatchObject({ ingresos: 200, gastos: 50, disponible: 150 });
  });
});

describe("healthScore", () => {
  it("sin ingresos no hay puntaje", () => {
    expect(healthScore(summarize([], cats)).label).toBe("Sin datos");
  });
  it("50/30/20 perfecto = 100", () => {
    const s = summarize(
      [
        tx({ category_id: "sueldo", monto: 10000 }),
        tx({ category_id: "renta", monto: 5000 }),
        tx({ category_id: "restaurantes", monto: 3000 }),
        tx({ category_id: "ahorro", monto: 2000 }),
      ],
      cats,
    );
    expect(healthScore(s).score).toBe(100);
  });
  it("gastar más de lo que entra penaliza", () => {
    const s = summarize(
      [tx({ category_id: "sueldo", monto: 10000 }), tx({ category_id: "compras", monto: 12000 })],
      cats,
    );
    const h = healthScore(s);
    expect(h.score).toBeLessThan(40);
    expect(h.label).toBe("En riesgo");
  });
});

describe("delta", () => {
  it("devuelve null sin base", () => {
    expect(delta(10, 0)).toBeNull();
    expect(delta(150, 100)).toBeCloseTo(0.5);
  });
});

describe("presupuestos", () => {
  it("marca estado según el porcentaje gastado", () => {
    const s = summarize([tx({ category_id: "delivery", monto: 900 }), tx({ category_id: "super", monto: 5000 })], cats);
    const st = budgetStatus(
      [
        { id: "a", grupo: "delivery", monto: 1000 },
        { id: "b", grupo: "alimentos", monto: 4000 },
        { id: "c", grupo: "salud", monto: 1000 },
      ],
      s,
    );
    expect(st.map((b) => b.estado)).toEqual(["cerca", "excedido", "ok"]);
  });
});

describe("recurrentes", () => {
  const txs = [
    tx({ category_id: "streaming-video", monto: 299, fecha: "2026-10-05", descripcion: "Netflix", recurrente: true }),
    tx({ category_id: "ia", monto: 400, fecha: "2026-10-12", descripcion: "Claude", recurrente: true }),
    tx({ category_id: "streaming-video", monto: 299, fecha: "2026-11-05", descripcion: "Netflix", recurrente: true }),
  ];
  it("detecta suscripciones activas sin duplicar", () => {
    const subs = activeSubscriptions(txs, "2026-11");
    expect(subs).toHaveLength(2);
    expect(subs.find((x) => x.descripcion === "Netflix")?.ultimaFecha).toBe("2026-11-05");
  });
  it("sugiere copiar solo los que faltan este mes", () => {
    expect(pendingRecurring(txs, "2026-11").map((t) => t.descripcion)).toEqual(["Claude"]);
  });
  it("ajusta el día al fin de mes", () => {
    expect(sameDayIn("2026-01-31", "2026-02")).toBe("2026-02-28");
  });
});
