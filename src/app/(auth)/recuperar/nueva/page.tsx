"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { PASSWORD_HINT, passwordError } from "@/lib/password";
import { getSupabase } from "@/lib/supabase/client";
import { AuthLayout, authError } from "../../auth-ui";

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwError = passwordError(password);
    if (pwError) return setError(pwError);
    setLoading(true);
    const { error } = await getSupabase().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(authError(error.message));
    router.replace("/");
  };

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Escribe tu nueva contraseña para entrar.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nueva contraseña" hint={PASSWORD_HINT}>
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </Field>
        {error && <p className="text-sm text-bad">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          Guardar y entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
