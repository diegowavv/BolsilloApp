import { describe, expect, it } from "vitest";
import { passwordError } from "./password";
import { safeRedirectPath } from "./redirect";

const O = "https://bolsillo-app-beryl.vercel.app";

describe("safeRedirectPath (redirección abierta)", () => {
  it("permite rutas internas", () => {
    expect(safeRedirectPath("/recuperar/nueva", O)).toBe("/recuperar/nueva");
    expect(safeRedirectPath("/movimientos?x=1", O)).toBe("/movimientos?x=1");
  });
  it.each([
    null,
    "",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "javascript:alert(1)",
    "/%2F%2Fevil.com/../..",
  ])("bloquea %s", (next) => {
    const r = safeRedirectPath(next as string | null, O);
    expect(r.startsWith("/")).toBe(true);
    expect(new URL(r, O).origin).toBe(O);
  });
});

describe("passwordError", () => {
  it("exige 8+ caracteres con letras y números", () => {
    expect(passwordError("abc12")).toMatch(/8/);
    expect(passwordError("abcdefgh")).toMatch(/números/);
    expect(passwordError("12345678")).toMatch(/letras/);
    expect(passwordError("bolsillo2026")).toBeNull();
  });
});
