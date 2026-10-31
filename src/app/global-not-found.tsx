import '@fontsource-variable/manrope';
import '@fontsource/cormorant-garamond/500.css';
import './globals.css';
import type { Metadata } from 'next';
import { LOCALES, LOCALE_META } from '@/lib/i18n';

export const metadata: Metadata = { title: 'Page introuvable — Samarcande Voyage', robots: { index: false } };

const TEXT: Record<string, [string, string, string]> = {
  fr: ['Cette page n’existe pas', 'Le lien est peut-être ancien. Le circuit, lui, est toujours là.', 'Retour à l’accueil'],
  en: ['This page does not exist', 'The link may be old. The tour, however, is still here.', 'Back to home'],
  ru: ['Такой страницы нет', 'Возможно, ссылка устарела. А тур — на месте.', 'На главную'],
  de: ['Diese Seite gibt es nicht', 'Der Link ist vielleicht veraltet. Die Reise gibt es noch.', 'Zur Startseite'],
};

const BOOT = `(function(){var d=document.documentElement;try{var s=localStorage.getItem('sv-theme');d.dataset.theme=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}})();`;

export default function GlobalNotFound() {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: BOOT }} /></head>
      <body>
        <main className="section" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <div className="wrap wrap--narrow" style={{ textAlign: 'center', display: 'grid', gap: 22, justifyItems: 'center' }}>
            <span className="h1" style={{ fontSize: 'clamp(96px,16vw,180px)', color: 'var(--gold)', fontStyle: 'italic' }}>404</span>
            {LOCALES.map((l) => (
              <p key={l} lang={l} className={l === 'fr' ? 'h3' : 'muted'}>
                {TEXT[l]![0]} — <a className="link-arrow" href={`/${l}/`}>{TEXT[l]![2]}</a>
              </p>
            ))}
            <p className="muted small">{TEXT.fr![1]} · {LOCALE_META.fr.label}</p>
          </div>
        </main>
      </body>
    </html>
  );
}
