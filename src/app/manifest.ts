import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bolsillo · Gastos e ingresos",
    short_name: "Bolsillo",
    description: "Controla tus gastos e ingresos del mes con gráficas claras.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f0",
    theme_color: "#6c5ce7",
    lang: "es-MX",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
