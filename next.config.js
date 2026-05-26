/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    ];
    return [
      // locale: false bypasses i18n path prefixing so /(.*) matches all routes
      { source: "/(.*)", locale: false, headers: securityHeaders },
    ];
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
