import type { Budget, Category, Goal, GroupKey, NewTransaction, Profile, Transaction } from "../types";

export interface FinanceData {
  profile: Profile;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

/** Capa de datos intercambiable: Supabase (nube) o navegador (modo demo). */
export interface FinanceRepo {
  mode: "cloud" | "demo";
  load(): Promise<FinanceData>;
  addTransactions(txs: NewTransaction[]): Promise<Transaction[]>;
  updateTransaction(id: string, patch: Partial<NewTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  addCategory(c: Omit<Category, "id" | "user_id">): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  setBudget(grupo: GroupKey, monto: number): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;
  addGoal(g: Omit<Goal, "id">): Promise<Goal>;
  updateGoal(id: string, patch: Partial<Omit<Goal, "id">>): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;
  updateProfile(patch: Partial<Pick<Profile, "nombre">>): Promise<Profile>;
  signOut(): Promise<void>;
}
