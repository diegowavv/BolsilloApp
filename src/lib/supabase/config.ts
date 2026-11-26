export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Clave pública de Supabase. La integración de Vercel la crea como
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; los proyectos antiguos usan
 * NEXT_PUBLIC_SUPABASE_ANON_KEY. Aceptamos cualquiera de las dos.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Sin claves de Supabase la app corre en "modo demo" con datos en el navegador. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
