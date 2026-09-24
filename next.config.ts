import type { NextConfig } from 'next';

/**
 * Export statique : chaque page de chaque langue est un fichier HTML prêt,
 * servi par n'importe quel CDN (Cloudflare Pages recommandé, cf. README).
 * Les formulaires passent par la fonction functions/api/lead.ts.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  experimental: { globalNotFound: true },
};

export default nextConfig;
