import type { NextConfig } from "next";

// Todas las pantallas dependen de la sesión del usuario, así que usamos
// renderizado dinámico clásico (sin Cache Components).
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
