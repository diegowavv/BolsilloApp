"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { getSupabase } from "@/lib/supabase/client";
import { AuthLayout, Divider, GoogleButton, authError } from "../auth-ui";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    setLoading(true);
    setError(null);
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { data: { full_name: nombre.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return setError(authError(error.message));
    if (data.session) {
      router.replace("/");
      router.refresh();
    } else {
      setSent(true); // hay que confirmar el correo
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Revisa tu correo" subtitle={`Te enviamos un enlace de confirmación a ${email}.`}>
        <div className="flex flex-col items-center rounded-3xl bg-surface-2/60 p-6 text-center">
          <MailCheck size={36} className="text-brand" />
          <p className="mt-3 text-sm text-ink-2">Abre el enlace para activar tu cuenta y entrar a Bolsillo.</p>
          <Link href="/login" className="mt-5 text-sm font-semibold text-brand hover:underline">
            Volver a iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Gratis. Tus datos te esperan cada vez que vuelvas.">
      <GoogleButton label="Registrarme con Google" />
      <Divider />
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre">
          <Input autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} />
        </Field>
        <Field label="Correo">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Contraseña" hint="Mínimo 8 caracteres.">
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </Field>
        {error && <p className="text-sm text-bad">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
