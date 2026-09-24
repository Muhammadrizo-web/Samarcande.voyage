'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LOCALES, LOCALE_META, href, routeFromPath, alternates, type Locale, type PageKey } from '@/lib/i18n';
import { Burger, Chevron, Cross, Globe, Mark, Moon, Sun, Arrow } from './Icons';

export type HeaderLabels = {
  nav: Record<'home' | 'tour' | 'dates' | 'dest' | 'agency' | 'infos' | 'contact', string>;
  book: string; menu: string; close: string; toLight: string; toDark: string; language: string;
};

const NAV: { key: keyof HeaderLabels['nav']; page: PageKey }[] = [
  { key: 'tour', page: 'tour' },
  { key: 'dates', page: 'dates' },
  { key: 'dest', page: 'destinations' },
  { key: 'agency', page: 'agency' },
  { key: 'infos', page: 'infos' },
  { key: 'contact', page: 'contact' },
];

export function Brand({ locale }: { locale: Locale }) {
  return (
    <Link href={href(locale, 'home')} className="brand">
      <Mark />
      <span className="brand__txt">
        <span className="brand__name">SAMARCANDE</span>{' '}
        <span className="brand__sub">VOYAGE</span>
      </span>
    </Link>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);
  const toggle = (e: React.MouseEvent) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
      try { localStorage.setItem('sv-theme', next); } catch { /* navigation privée */ }
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (d.startViewTransition && !reduce) {
      const root = document.documentElement;
      root.style.setProperty('--vt-x', `${e.clientX}px`);
      root.style.setProperty('--vt-y', `${e.clientY}px`);
      d.startViewTransition(apply);
    } else apply();
  };
  return { theme, toggle };
}

export function Header({ locale, labels }: { locale: Locale; labels: HeaderLabels }) {
  const pathname = usePathname();
  const current = routeFromPath(pathname);
  const alts = current ? alternates(current.route) : Object.fromEntries(LOCALES.map((l) => [l, href(l, 'home')]));
  const isHome = current?.route.page === 'home';

  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setStuck(y > 12);
        // en mode « une section par écran », l'en-tête reste visible : chaque écran est calé dessous
        const paging = document.documentElement.classList.contains('paging-on');
        setHidden(!paging && y > 480 && y > last + 4);
        if (y < last - 4) setHidden(false);
        last = y;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { setOpen(false); setLangOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setLangOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!langOpen) return;
    const onDoc = (e: MouseEvent) => { if (!langRef.current?.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [langOpen]);

  const isCurrent = (page: PageKey) =>
    current?.route.page === page || (page === 'destinations' && current?.route.page === 'city');

  const setLangPref = (l: Locale) => { try { localStorage.setItem('sv-lang', l); } catch { /* */ } };

  return (
    <>
      <header className={`hdr${stuck || !isHome ? ' is-stuck' : ''}${hidden && !open ? ' is-hidden' : ''}`}>
        <div className="wrap hdr__in">
          <Brand locale={locale} />
          <nav className="nav" aria-label="Navigation">
            {NAV.map((n) => (
              <Link key={n.key} href={href(locale, n.page)} aria-current={isCurrent(n.page) ? 'page' : undefined}>
                {labels.nav[n.key]}
              </Link>
            ))}
          </nav>
          <div className="hdr__tools">
            <div className="lang" ref={langRef}>
              <button type="button" className="lang__btn" aria-expanded={langOpen} aria-haspopup="true" aria-label={`${LOCALE_META[locale].short} — ${labels.language}`}
                onClick={(e) => { e.stopPropagation(); setLangOpen((v) => !v); }}>
                <Globe /> {LOCALE_META[locale].short} <Chevron />
              </button>
              {langOpen && (
                <div className="lang__menu" role="menu">
                  {LOCALES.map((l) => (
                    <Link key={l} role="menuitem" href={alts[l] ?? href(l, 'home')} hrefLang={l} lang={l}
                      aria-current={l === locale ? 'true' : undefined} onClick={() => setLangPref(l)}>
                      {LOCALE_META[l].label} <span>{LOCALE_META[l].short}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="icon-btn theme-btn" onClick={toggle}
              aria-label={theme === 'dark' ? labels.toLight : labels.toDark} title={theme === 'dark' ? labels.toLight : labels.toDark}>
              <span style={{ display: 'grid' }}><Sun /><Moon /></span>
            </button>
            <Link href={href(locale, 'dates')} className="btn btn--primary btn--sm hdr__cta">{labels.book}</Link>
            <button type="button" className="icon-btn burger" aria-label={labels.menu} aria-expanded={open} aria-controls="drawer" onClick={() => setOpen(true)}>
              <Burger />
            </button>
          </div>
        </div>
      </header>

      <div id="drawer" className={`drawer${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label={labels.menu} aria-hidden={!open}>
        <div className="drawer__top">
          <Brand locale={locale} />
          <button type="button" className="icon-btn" aria-label={labels.close} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}><Cross size={22} /></button>
        </div>
        <nav aria-label="Navigation">
          {[{ key: 'home' as const, page: 'home' as PageKey }, ...NAV].map((n, i) => (
            <Link key={n.key} href={href(locale, n.page)} tabIndex={open ? 0 : -1}
              aria-current={isCurrent(n.page) ? 'page' : undefined}
              style={{ transitionDelay: open ? `${120 + i * 45}ms` : '0ms' }}>
              {labels.nav[n.key]}
            </Link>
          ))}
        </nav>
        <div className="drawer__foot">
          <Link href={href(locale, 'dates')} className="btn btn--primary btn--block" tabIndex={open ? 0 : -1}>{labels.book} <Arrow /></Link>
          <div className="drawer__langs">
            {LOCALES.map((l) => (
              <Link key={l} href={alts[l] ?? href(l, 'home')} hrefLang={l} tabIndex={open ? 0 : -1}
                aria-current={l === locale ? 'true' : undefined} onClick={() => setLangPref(l)}>
                {LOCALE_META[l].label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
