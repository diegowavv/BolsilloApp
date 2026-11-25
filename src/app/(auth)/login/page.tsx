"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { getSupabase } from "@/lib/supabase/client";
import { AuthLayout, Divider, GoogleButton, authError } from "../auth-ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(authError(error.message));
    router.replace("/");
    router.refresh();
  };

  return (
    <AuthLayout title="Bienvenido de vuelta" subtitle="Entra para ver tus números del mes.">
      <GoogleButton label="Continuar con Google" />
      <Divider />
      <form onSubmit={submit} className="space-y-4">
        <Field label="Correo">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Contraseña">
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <div className="text-right">
          <Link href="/recuperar" className="text-xs font-medium text-brand hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {error && <p className="text-sm text-bad">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando…" : "Iniciar sesión"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-brand hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </AuthLayout>
  );
}
