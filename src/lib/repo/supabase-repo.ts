"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "../supabase/client";
import type { Budget, Category, Goal, Profile, Transaction } from "../types";
import type { FinanceRepo } from "./types";

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/** Postgres devuelve `numeric` como texto: lo convertimos a número */
const num = <T extends object>(row: T, keys: (keyof T)[]): T => {
  const out = { ...row };
  for (const k of keys) out[k] = Number(row[k]) as T[keyof T];
  return out;
};

export function createSupabaseRepo(): FinanceRepo {
  const sb: SupabaseClient = getSupabase();

  async function userId() {
    const { data } = await sb.auth.getUser();
    if (!data.user) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
    return data.user.id;
  }

  return {
    mode: "cloud",

    async load() {
      const { data: auth } = await sb.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");

      const [profileRes, cats, txs, budgets, goals] = await Promise.all([
        sb.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        sb.from("categories").select("*").order("nombre"),
        sb.from("transactions").select("*").order("fecha", { ascending: false }).order("created_at", { ascending: false }).limit(10000),
        sb.from("budgets").select("*"),
        sb.from("goals").select("*").order("created_at"),
      ]);

      const p = check(profileRes) as Profile | null;
      const profile: Profile = {
        id: user.id,
        nombre: p?.nombre ?? (user.user_metadata?.full_name as string | undefined) ?? null,
        email: user.email ?? null,
        moneda: p?.moneda ?? "MXN",
        plan: p?.plan ?? "free",
      };

      return {
        profile,
        categories: check(cats) as Category[],
        transactions: (check(txs) as Transaction[]).map((t) => num(t, ["monto"])),
        budgets: (check(budgets) as Budget[]).map((b) => num(b, ["monto"])),
        goals: (check(goals) as Goal[]).map((g) => num(g, ["objetivo", "actual"])),
      };
    },

    async addTransactions(txs) {
      const uid = await userId();
      const rows = txs.map((t) => ({ ...t, user_id: uid }));
      const data = check(await sb.from("transactions").insert(rows).select()) as Transaction[];
      return data.map((t) => num(t, ["monto"]));
    },

    async updateTransaction(id, patch) {
      const data = check(await sb.from("transactions").update(patch).eq("id", id).select().single()) as Transaction;
      return num(data, ["monto"]);
    },

    async deleteTransaction(id) {
      check(await sb.from("transactions").delete().eq("id", id));
    },

    async addCategory(c) {
      const uid = await userId();
      return check(await sb.from("categories").insert({ ...c, user_id: uid }).select().single()) as Category;
    },

    async deleteCategory(id) {
      check(await sb.from("categories").delete().eq("id", id));
    },

    async setBudget(grupo, monto) {
      const uid = await userId();
      const data = check(
        await sb.from("budgets").upsert({ user_id: uid, grupo, monto }, { onConflict: "user_id,grupo" }).select().single(),
      ) as Budget;
      return num(data, ["monto"]);
    },

    async deleteBudget(id) {
      check(await sb.from("budgets").delete().eq("id", id));
    },

    async addGoal(g) {
      const uid = await userId();
      const data = check(await sb.from("goals").insert({ ...g, user_id: uid }).select().single()) as Goal;
      return num(data, ["objetivo", "actual"]);
    },

    async updateGoal(id, patch) {
      const data = check(await sb.from("goals").update(patch).eq("id", id).select().single()) as Goal;
      return num(data, ["objetivo", "actual"]);
    },

    async deleteGoal(id) {
      check(await sb.from("goals").delete().eq("id", id));
    },

    async updateProfile(patch) {
      const uid = await userId();
      check(await sb.from("profiles").update(patch).eq("id", uid));
      return (await this.load()).profile;
    },

    async signOut() {
      await sb.auth.signOut();
    },
  };
}
