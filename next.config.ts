import type { NextConfig } from "next";

/**
 * Quem pode abrir a degustação num iframe: o próprio app, a recepção do interativAI (com e sem
 * www) e as prévias de deploy da Vercel (*.vercel.app). A mesma lista decide para quem a ilhota
 * manda mensagens (src/componentes/degustacao/recepcao.ts); um teste confere as duas.
 */
export const FRAME_ANCESTORS_DEGUSTACAO =
  "frame-ancestors 'self' https://interativai.com https://www.interativai.com https://*.vercel.app";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/degustacao",
        headers: [{ key: "Content-Security-Policy", value: FRAME_ANCESTORS_DEGUSTACAO }],
      },
    ];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
