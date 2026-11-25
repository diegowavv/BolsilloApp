import { ImageResponse } from "next/og";

const SIZES = new Set([180, 192, 512]);

/** Íconos PNG de la PWA generados al vuelo: /icons/192, /icons/512, /icons/180 */
export async function GET(_req: Request, ctx: RouteContext<"/icons/[size]">) {
  const { size: raw } = await ctx.params;
  const size = SIZES.has(Number(raw)) ? Number(raw) : 192;
  const u = size / 64;
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 30 * u,
            height: 26 * u,
            background: "white",
            borderRadius: 6 * u,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ height: 3 * u, marginTop: 6 * u, background: "#6c5ce7" }} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 3 * u, padding: 4 * u }}>
            <div style={{ width: 7 * u, height: 7 * u, borderRadius: 99, background: "#1baf7a" }} />
            <div style={{ width: 7 * u, height: 7 * u, borderRadius: 99, background: "#eda100" }} />
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
