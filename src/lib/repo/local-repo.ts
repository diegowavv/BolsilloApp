"use client";

import { SYSTEM_CATEGORIES } from "../categories";
import type { Budget, Category, Goal, Profile, Transaction } from "../types";
import { uid } from "../utils";
import type { FinanceRepo } from "./types";

const KEY = "bolsillo:demo:v1";

interface Stored {
  profile: Profile;
  customCategories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

const empty = (): Stored => ({
  profile: { id: "demo", nombre: null, email: null, moneda: "MXN", plan: "free" },
  customCategories: [],
  transactions: [],
  budgets: [],
  goals: [],
});

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {
    // almacenamiento bloqueado o dañado: empezamos vacío
  }
  return empty();
}

function write(s: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // sin almacenamiento disponible (modo privado): los datos viven solo en memoria
  }
}

const sortTx = (a: Transaction, b: Transaction) =>
  b.fecha.localeCompare(a.fecha) || (b.created_at ?? "").localeCompare(a.created_at ?? "");

/** Modo demo: todo se guarda en este navegador (localStorage). */
export function createLocalRepo(): FinanceRepo {
  let state = read();
  const save = () => write(state);

  return {
    mode: "demo",

    async load() {
      state = read();
      return {
        profile: state.profile,
        categories: [...SYSTEM_CATEGORIES, ...state.customCategories],
        transactions: [...state.transactions].sort(sortTx),
        budgets: state.budgets,
        goals: state.goals,
      };
    },

    async addTransactions(txs) {
      const now = new Date().toISOString();
      const created = txs.map((t) => ({ ...t, id: uid(), created_at: now }));
      state.transactions.push(...created);
      save();
      return created;
    },

    async updateTransaction(id, patch) {
      const i = state.transactions.findIndex((t) => t.id === id);
      if (i < 0) throw new Error("Movimiento no encontrado");
      state.transactions[i] = { ...state.transactions[i], ...patch };
      save();
      return state.transactions[i];
    },

    async deleteTransaction(id) {
      state.transactions = state.transactions.filter((t) => t.id !== id);
      save();
    },

    async addCategory(c) {
      const cat: Category = { ...c, id: uid(), user_id: "demo" };
      state.customCategories.push(cat);
      save();
      return cat;
    },

    async deleteCategory(id) {
      if (state.transactions.some((t) => t.category_id === id)) {
        throw new Error("No puedes borrar una categoría que tiene movimientos.");
      }
      state.customCategories = state.customCategories.filter((c) => c.id !== id);
      save();
    },

    async setBudget(grupo, monto) {
      const existing = state.budgets.find((b) => b.grupo === grupo);
      if (existing) existing.monto = monto;
      else state.budgets.push({ id: uid(), grupo, monto });
      save();
      return state.budgets.find((b) => b.grupo === grupo)!;
    },

    async deleteBudget(id) {
      state.budgets = state.budgets.filter((b) => b.id !== id);
      save();
    },

    async addGoal(g) {
      const goal: Goal = { ...g, id: uid() };
      state.goals.push(goal);
      save();
      return goal;
    },

    async updateGoal(id, patch) {
      const i = state.goals.findIndex((g) => g.id === id);
      state.goals[i] = { ...state.goals[i], ...patch };
      save();
      return state.goals[i];
    },

    async deleteGoal(id) {
      state.goals = state.goals.filter((g) => g.id !== id);
      save();
    },

    async updateProfile(patch) {
      state.profile = { ...state.profile, ...patch };
      save();
      return state.profile;
    },

    async signOut() {
      // En modo demo "cerrar sesión" borra los datos de este navegador.
      try {
        localStorage.removeItem(KEY);
      } catch {}
      state = empty();
    },
  };
}
