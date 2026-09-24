import '@fontsource-variable/manrope';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '../globals.css';
import '../screens.css';

import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { SITE } from '@/content/site';
import { getDict } from '@/i18n';
import { LOCALES, isLocale } from '@/lib/i18n';
import { organizationLd } from '@/lib/seo';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactFab } from '@/components/Blocks';
import { Reveal } from '@/components/Reveal';
import { Screens } from '@/components/client/Screens';
import { JsonLd } from '@/components/JsonLd';

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  applicationName: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192' }], apple: '/apple-icon.png' },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1219' },
  ],
};

/* Posé avant le premier rendu : pas de flash de thème, et les animations
   d'apparition ne masquent rien si JavaScript échoue (sécurité à 3 s). */
const BOOT = `(function(){var d=document.documentElement;try{var s=localStorage.getItem('sv-theme');d.dataset.theme=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){d.dataset.theme='light'}d.classList.add('js');setTimeout(function(){if(!window.__rv)d.classList.remove('js')},3000)})();`;

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a className="skip" href="#main">{t.ui.skip}</a>
        <Header
          locale={locale}
          labels={{
            nav: t.nav, book: t.ui.book, menu: t.ui.menu, close: t.ui.close,
            toLight: t.ui.themeToLight, toDark: t.ui.themeToDark, language: t.ui.language,
          }}
        />
        <main id="main">{children}</main>
        <Footer locale={locale} t={t} />
        <ContactFab t={t} />
        <Reveal />
        <Screens label={t.ui.sections} />
        <JsonLd data={organizationLd(locale, t)} />
      </body>
    </html>
  );
}
