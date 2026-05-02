/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // i18n nativo do Next.js — gera /pt-BR (root) e /en/ como páginas estáticas
  // indexáveis separadamente pelo Google. Compatível com Vercel free tier (SSG).
  i18n: {
    locales: ["pt-BR", "en"],
    defaultLocale: "pt-BR",
    localeDetection: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 250,
        ignored: ["**/node_modules", "**/.next", "**/.git"],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
