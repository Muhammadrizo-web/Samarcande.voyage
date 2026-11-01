import Link from 'next/link';
import { asset } from '@/lib/asset';
import type { ReactNode } from 'react';
import { SITE } from '@/content/site';
import type { Dictionary } from '@/i18n/fr';
import { href, type Locale, type PageKey } from '@/lib/i18n';
import { Arrow, Telegram, WhatsApp } from './Icons';

export function Eyebrow({ children, n }: { children: ReactNode; n?: number }) {
  return (
    <span className="eyebrow">
      {n !== undefined && <span className="eyebrow__n">{String(n).padStart(2, '0')}</span>}
      {children}
    </span>
  );
}

export function SectionHead({ eyebrow, n, title, lead, aside, as = 'h2', split }: {
  eyebrow: string; n?: number; title: ReactNode; lead?: ReactNode; aside?: ReactNode; as?: 'h1' | 'h2'; split?: boolean;
}) {
  const H = as;
  const cls = as === 'h1' ? 'h1' : 'h2';
  if (split) {
    return (
      <div className="sec-head sec-head--split">
        <div className="grid gap-5" data-rv="">
          <Eyebrow n={n}>{eyebrow}</Eyebrow>
          <H className={cls}>{title}</H>
        </div>
        <div className="sec-head__aside" data-rv="">
          {lead && <p className="lead">{lead}</p>}
          {aside}
        </div>
      </div>
    );
  }
  return (
    <div className="sec-head" data-rv="">
      <Eyebrow n={n}>{eyebrow}</Eyebrow>
      <H className={cls}>{title}</H>
      {lead && <p className="lead">{lead}</p>}
      {aside}
    </div>
  );
}


/**
 * Fond photo d'une section (photos réelles du circuit, cf. scripts/build-backdrops.mjs).
 * Photo nette en plein cadre ; voile ivoire en thème clair, voile nuit en thème sombre (globals.css).
 */
export type Backdrop = 'gk3' | 'g8' | 'city-tachkent' | 'g2' | 'hero';
export function SectionBg({ name, pos = '50% 50%', side = 'full', kind = 'photo', soft }: {
  name: Backdrop; pos?: string; side?: 'bottom' | 'top' | 'left' | 'right' | 'full'; kind?: 'photo' | 'band';
  /** voile clair plus léger : la photo reste plus visible */
  soft?: boolean;
}) {
  const set = (ext: string) => `${asset(`/bg/${name}-900.${ext}`)} 900w, ${asset(`/bg/${name}-1600.${ext}`)} 1600w`;
  return (
    <div className={`sec-bg sec-bg--${kind} sec-bg--${side}${soft ? ' sec-bg--soft' : ''}`} aria-hidden>
      <picture>
        <source type="image/avif" srcSet={set('avif')} sizes="100vw" />
        <img src={asset(`/bg/${name}-1600.webp`)} srcSet={set('webp')} sizes="100vw" alt="" loading="lazy" decoding="async" style={{ objectPosition: pos }} />
      </picture>
    </div>
  );
}

export function CtaBand({ locale, t, title, text, btn, to = 'dates' }: {
  locale: Locale; t: Dictionary; title?: string; text?: string; btn?: string; to?: PageKey;
}) {
  return (
    <section className="band band--photo">
      <SectionBg name="hero" kind="band" pos="50% 45%" />
      <div className="wrap band__in">
        <div data-rv="">
          <h2 className="h2">{title ?? t.band.title}</h2>
          <p className="lead">{text ?? t.band.text}</p>
        </div>
        <div data-rv="">
          <Link href={href(locale, to)} className="btn btn--primary">{btn ?? t.band.btn} <Arrow /></Link>
        </div>
      </div>
    </section>
  );
}

export function ContactFab({ t }: { t: Dictionary }) {
  if (!SITE.whatsapp && !SITE.telegram) return null;
  return (
    <div className="fab no-print">
      {SITE.telegram && (
        <a className="fab__tg" href={`https://t.me/${SITE.telegram}`} target="_blank" rel="noopener" aria-label={t.ui.writeTelegram} title={t.ui.writeTelegram}>
          <Telegram />
        </a>
      )}
      {SITE.whatsapp && (
        <a className="fab__wa" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" aria-label={t.ui.writeWhatsapp} title={t.ui.writeWhatsapp}>
          <WhatsApp />
        </a>
      )}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((it, i) => (
          <li key={i}>{it.href ? <Link href={it.href}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}
