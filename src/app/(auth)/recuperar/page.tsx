"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { getSupabase } from "@/lib/supabase/client";
import { AuthLayout, authError } from "../auth-ui";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/recuperar/nueva`,
    });
    setLoading(false);
    if (error) return setError(authError(error.message));
    setSent(true);
  };

  return (
    <AuthLayout title="Recupera tu contraseña" subtitle="Te enviaremos un enlace para crear una nueva.">
      {sent ? (
        <p className="rounded-2xl bg-surface-2/70 p-4 text-sm text-ink-2">
          Si existe una cuenta con <b>{email}</b>, recibirás un correo en unos minutos.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Correo">
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          {error && <p className="text-sm text-bad">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            Enviar enlace
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
