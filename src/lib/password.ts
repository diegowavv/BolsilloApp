/** Mismas reglas que Supabase Auth: mínimo 8 caracteres con letras y números. */
export const PASSWORD_HINT = "Mínimo 8 caracteres, con letras y números.";

export function passwordError(pw: string): string | null {
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (pw.length > 72) return "La contraseña es demasiado larga (máximo 72 caracteres).";
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return "La contraseña debe incluir letras y números.";
  return null;
}
