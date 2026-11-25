"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowLeftRight, Gauge, LayoutGrid, LogOut, Menu, PiggyBank, Plus, Repeat, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinance } from "./providers/finance-provider";
import { TransactionModal } from "./transactions/transaction-modal";
import { Logo } from "./logo";

const NAV = [
  { href: "/", label: "Inicio", icon: LayoutGrid },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/presupuestos", label: "Presupuestos", icon: Gauge },
  { href: "/ahorro", label: "Ahorro", icon: PiggyBank },
  { href: "/suscripciones", label: "Suscripciones", icon: Repeat },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { profile, mode, openQuickAdd, signOut, error } = useFinance();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const name = profile.nombre || profile.email?.split("@")[0] || (mode === "demo" ? "Invitado" : "");

  return (
    <div className="min-h-dvh">
      {/* Barra lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 px-2">
          <Logo />
        </Link>
        <button
          onClick={() => openQuickAdd()}
          className="mb-6 flex h-11 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-brand-ink shadow-card transition hover:brightness-110"
        >
          <Plus size={18} /> Nuevo movimiento
        </button>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: I }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                isActive(href) ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              <I size={18} strokeWidth={2} /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink">
            {(name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted">{mode === "demo" ? "Modo demo" : profile.plan === "premium" ? "Premium" : "Plan gratis"}</p>
          </div>
          {mode === "cloud" && (
            <button onClick={signOut} className="rounded-full p-2 text-muted hover:bg-surface hover:text-ink" aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Encabezado móvil */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-page/85 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink">
          {(name || "?").charAt(0).toUpperCase()}
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          {mode === "demo" && (
            <div className="mb-5 rounded-2xl border border-dashed border-brand/40 bg-brand-soft/60 px-4 py-2.5 text-[13px] text-ink-2">
              <b className="text-brand">Modo demo:</b> tus datos se guardan solo en este navegador. Conecta Supabase (ver README) para
              tener cuentas de usuario en la nube.
            </div>
          )}
          {error && (
            <div role="alert" className="mb-5 rounded-2xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-[13px] text-bad">
              {error}
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Navegación inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2">
          {NAV.slice(0, 2).map((item) => (
            <BottomLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
          <div className="flex justify-center">
            <button
              onClick={() => openQuickAdd()}
              className="-mt-6 flex size-14 items-center justify-center rounded-full bg-brand text-brand-ink shadow-lg ring-4 ring-page transition active:scale-95"
              aria-label="Nuevo movimiento"
            >
              <Plus size={26} />
            </button>
          </div>
          <BottomLink {...NAV[3]} active={isActive(NAV[3].href)} />
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", moreOpen ? "text-brand" : "text-muted")}
          >
            {moreOpen ? <X size={20} /> : <Menu size={20} />}
            Más
          </button>
        </div>
        {moreOpen && (
          <div className="absolute bottom-full right-3 mb-2 w-56 animate-fade-up rounded-2xl border border-line bg-surface p-2 shadow-xl">
            {[NAV[2], NAV[4], NAV[5]].map(({ href, label, icon: I }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", isActive(href) ? "bg-brand-soft text-brand" : "hover:bg-surface-2")}
              >
                <I size={18} /> {label}
              </Link>
            ))}
            {mode === "cloud" && (
              <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bad hover:bg-surface-2">
                <LogOut size={18} /> Cerrar sesión
              </button>
            )}
          </div>
        )}
      </nav>

      <TransactionModal />
    </div>
  );
}

function BottomLink({ href, label, icon: I, active }: { href: string; label: string; icon: typeof LayoutGrid; active: boolean }) {
  return (
    <Link href={href} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", active ? "text-brand" : "text-muted")}>
      <I size={20} strokeWidth={active ? 2.3 : 1.9} />
      {label}
    </Link>
  );
}
