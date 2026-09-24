import Link from 'next/link';
import type { ReactNode } from 'react';
import { SITE } from '@/content/site';
import type { Dictionary } from '@/i18n/fr';
import { href, type Locale } from '@/lib/i18n';
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

export function CtaBand({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section className="band">
      <div className="wrap band__in">
        <div data-rv="">
          <h2 className="h2">{t.band.title}</h2>
          <p className="lead">{t.band.text}</p>
        </div>
        <div data-rv="">
          <Link href={href(locale, 'dates')} className="btn btn--primary">{t.band.btn} <Arrow /></Link>
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
