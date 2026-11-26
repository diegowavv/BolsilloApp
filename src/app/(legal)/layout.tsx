import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="inline-block">
          <Logo />
        </Link>
        <article className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-10 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:mt-1 [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-ink-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-ink-2">
          {children}
        </article>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/privacidad" className="hover:text-ink">
            Privacidad
          </Link>{" "}
          ·{" "}
          <Link href="/terminos" className="hover:text-ink">
            Términos
          </Link>{" "}
          ·{" "}
          <Link href="/login" className="hover:text-ink">
            Entrar a Bolsillo
          </Link>
        </p>
      </div>
    </div>
  );
}
