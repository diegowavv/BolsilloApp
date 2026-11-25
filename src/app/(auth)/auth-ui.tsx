"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Bug, PieChart, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#17142e] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-[#6c5ce7]/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-[#1baf7a]/30 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <LogoMark size={40} />
          <span className="text-xl font-bold">Bolsillo</span>
        </div>
        <div className="relative">
          <h2 className="max-w-md text-4xl font-bold leading-tight">Tu dinero, claro y bajo control.</h2>
          <ul className="mt-8 space-y-4 text-white/80">
            <li className="flex items-center gap-3">
              <PieChart size={20} className="text-[#86b6ef]" /> Gráficas de todos tus gastos del mes
            </li>
            <li className="flex items-center gap-3">
              <Bug size={20} className="text-[#eda100]" /> Detecta tus gastos hormiga e innecesarios
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-[#1baf7a]" /> Tus datos, privados y siempre disponibles
            </li>
          </ul>
        </div>
        <p className="relative text-sm text-white/50">Gratis. En pesos mexicanos.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark size={36} />
            <span className="text-lg font-bold">Bolsillo</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mb-7 mt-1 text-sm text-muted">{subtitle}</p>
          {isSupabaseConfigured ? (
            children
          ) : (
            <div className="space-y-4 rounded-3xl border border-dashed border-brand/40 bg-brand-soft/50 p-5 text-sm text-ink-2">
              <p>
                <b className="text-brand">Modo demo.</b> Aún no se han configurado las claves de Supabase, así que el inicio de sesión está
                desactivado. Puedes usar la app y tus datos se guardarán en este navegador.
              </p>
              <Link href="/" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand font-semibold text-brand-ink">
                Entrar al modo demo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GoogleButton({ label }: { label: string }) {
  const signIn = async () => {
    await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };
  return (
    <button
      type="button"
      onClick={signIn}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-line bg-surface text-sm font-medium transition hover:bg-surface-2"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {label}
    </button>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-line" /> o con tu correo <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Traduce los errores más comunes de Supabase Auth */
export function authError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Confirma tu correo antes de entrar (revisa tu bandeja).";
  if (m.includes("already registered")) return "Ese correo ya tiene una cuenta. Inicia sesión.";
  if (m.includes("password should be")) return "La contraseña debe tener al menos 8 caracteres.";
  if (m.includes("rate limit")) return "Demasiados intentos. Espera un momento.";
  return msg;
}
