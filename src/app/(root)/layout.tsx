import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE } from '@/content/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE.url}/fr/`,
    languages: { fr: `${SITE.url}/fr/`, en: `${SITE.url}/en/`, ru: `${SITE.url}/ru/`, de: `${SITE.url}/de/`, 'x-default': `${SITE.url}/fr/` },
  },
};

export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
