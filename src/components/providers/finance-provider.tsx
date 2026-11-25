"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { currentMonthKey } from "@/lib/finance";
import { createLocalRepo } from "@/lib/repo/local-repo";
import { createSupabaseRepo } from "@/lib/repo/supabase-repo";
import type { FinanceData, FinanceRepo } from "@/lib/repo/types";
import { SAMPLE_BUDGETS, SAMPLE_GOALS, sampleTransactions } from "@/lib/sample-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Budget, Category, Goal, GroupKey, NewTransaction, Profile, Transaction } from "@/lib/types";

interface FinanceContextValue extends FinanceData {
  mode: "cloud" | "demo";
  loading: boolean;
  error: string | null;
  month: string;
  setMonth: (m: string) => void;
  categoryById: Map<string, Category>;
  addTransactions: (txs: NewTransaction[]) => Promise<void>;
  updateTransaction: (id: string, patch: Partial<NewTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, "id" | "user_id">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setBudget: (grupo: GroupKey, monto: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id">>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, "nombre">>) => Promise<void>;
  loadSampleData: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Abre el formulario rápido de movimiento (desde cualquier pantalla) */
  quickAdd: { open: boolean; editing: Transaction | null };
  openQuickAdd: (editing?: Transaction | null) => void;
  closeQuickAdd: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const MONTH_KEY = "bolsillo:month";
const MODE: "cloud" | "demo" = isSupabaseConfigured ? "cloud" : "demo";

let repoSingleton: FinanceRepo | null = null;
/** Se crea solo en el navegador, la primera vez que se necesita. */
function getRepo(): FinanceRepo {
  if (!repoSingleton) repoSingleton = isSupabaseConfigured ? createSupabaseRepo() : createLocalRepo();
  return repoSingleton;
}

const emptyData: FinanceData = {
  profile: { id: "", nombre: null, email: null, moneda: "MXN", plan: "free" },
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
};

const byDateDesc = (a: Transaction, b: Transaction) =>
  b.fecha.localeCompare(a.fecha) || (b.created_at ?? "").localeCompare(a.created_at ?? "");

export function FinanceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [data, setData] = useState<FinanceData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonthState] = useState(currentMonthKey());
  const [quickAdd, setQuickAdd] = useState<{ open: boolean; editing: Transaction | null }>({ open: false, editing: null });


  const reload = useCallback(async () => {
    const repo = getRepo();
    try {
      setData(await repo.load());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar tus datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(MONTH_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restaurar preferencia del navegador tras hidratar
      if (saved && /^\d{4}-\d{2}$/.test(saved)) setMonthState(saved);
    } catch {}
    reload();
  }, [reload]);

  const setMonth = useCallback((m: string) => {
    setMonthState(m);
    try {
      sessionStorage.setItem(MONTH_KEY, m);
    } catch {}
  }, []);

  /** Ejecuta una operación y muestra el error si falla */
  const run = useCallback(async <T,>(fn: (repo: FinanceRepo) => Promise<T>) => {
    const repo = getRepo();
    try {
      return await fn(repo);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Algo salió mal.";
      setError(msg);
      throw e;
    }
  }, []);

  const value = useMemo<FinanceContextValue>(() => {
    return {
      ...data,
      mode: MODE,
      loading,
      error,
      month,
      setMonth,
      categoryById: new Map(data.categories.map((c) => [c.id, c])),

      addTransactions: async (txs) => {
        const created = await run((r) => r.addTransactions(txs));
        setData((d) => ({ ...d, transactions: [...created, ...d.transactions].sort(byDateDesc) }));
      },
      updateTransaction: async (id, patch) => {
        const updated = await run((r) => r.updateTransaction(id, patch));
        setData((d) => ({ ...d, transactions: d.transactions.map((t) => (t.id === id ? updated : t)).sort(byDateDesc) }));
      },
      deleteTransaction: async (id) => {
        await run((r) => r.deleteTransaction(id));
        setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
      },
      addCategory: async (c) => {
        const created = await run((r) => r.addCategory(c));
        setData((d) => ({ ...d, categories: [...d.categories, created] }));
      },
      deleteCategory: async (id) => {
        await run((r) => r.deleteCategory(id));
        setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }));
      },
      setBudget: async (grupo, monto) => {
        const b = await run((r) => r.setBudget(grupo, monto));
        setData((d) => ({ ...d, budgets: [...d.budgets.filter((x: Budget) => x.grupo !== grupo), b] }));
      },
      deleteBudget: async (id) => {
        await run((r) => r.deleteBudget(id));
        setData((d) => ({ ...d, budgets: d.budgets.filter((b) => b.id !== id) }));
      },
      addGoal: async (g) => {
        const created = await run((r) => r.addGoal(g));
        setData((d) => ({ ...d, goals: [...d.goals, created] }));
      },
      updateGoal: async (id, patch) => {
        const updated = await run((r) => r.updateGoal(id, patch));
        setData((d) => ({ ...d, goals: d.goals.map((g) => (g.id === id ? updated : g)) }));
      },
      deleteGoal: async (id) => {
        await run((r) => r.deleteGoal(id));
        setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
      },
      updateProfile: async (patch) => {
        const profile = await run((r) => r.updateProfile(patch));
        setData((d) => ({ ...d, profile }));
      },
      loadSampleData: async () => {
        await run(async (r) => {
          await r.addTransactions(sampleTransactions(currentMonthKey()));
          for (const [g, m] of SAMPLE_BUDGETS) await r.setBudget(g, m);
          for (const goal of SAMPLE_GOALS) await r.addGoal(goal);
        });
        await reload();
      },
      signOut: async () => {
        await getRepo().signOut();
        if (MODE === "cloud") {
          router.replace("/login");
          router.refresh();
        } else {
          await reload();
        }
      },
      quickAdd,
      openQuickAdd: (editing = null) => setQuickAdd({ open: true, editing }),
      closeQuickAdd: () => setQuickAdd({ open: false, editing: null }),
    };
  }, [data, loading, error, month, setMonth, run, reload, router, quickAdd]);

  return <FinanceContext value={value}>{children}</FinanceContext>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance debe usarse dentro de <FinanceProvider>");
  return ctx;
}
