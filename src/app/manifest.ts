import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Samarcande Voyage',
    short_name: 'Samarcande',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f1',
    theme_color: '#0c2436',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
