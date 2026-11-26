/**
 * Solo permite redirigir a rutas internas. Bloquea "//evil.com", "/\evil.com",
 * esquemas como "javascript:" y cualquier URL que resuelva a otro dominio.
 */
export function safeRedirectPath(next: string | null, origin: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/";
  try {
    const url = new URL(next, origin);
    return url.origin === origin ? `${url.pathname}${url.search}` : "/";
  } catch {
    return "/";
  }
}
