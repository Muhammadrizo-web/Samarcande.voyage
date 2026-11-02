'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LOCALES, LOCALE_META, href, routeFromPath, alternates, type Locale, type PageKey } from '@/lib/i18n';
import { Chevron, Globe, Moon, Sun } from './Icons';
import { asset } from '@/lib/asset';

export type HeaderLabels = {
  nav: Record<'home' | 'tour' | 'custom' | 'group' | 'dest' | 'reviews' | 'quote' | 'contact', string>;
  book: string; quote: string; menu: string; close: string; toLight: string; toDark: string; language: string;
};

/**
 * Menu (ordre demandé par l'agence), toujours visible sous le logo :
 * barre de navigation centrée sur ordinateur, rangée défilante sur téléphone.
 * « Voyages en groupe » = départs garantis (page dates) ; « Témoignages » = encart avis (page agence).
 */
const NAV: { key: keyof HeaderLabels['nav']; page: PageKey; hash?: string; current?: boolean }[] = [
  { key: 'home', page: 'home', current: true },
  { key: 'tour', page: 'tour', current: true },
  { key: 'custom', page: 'custom', current: true },
  { key: 'group', page: 'dates', current: true },
  { key: 'dest', page: 'destinations', current: true },
  { key: 'reviews', page: 'agency', hash: '#avis' },
  { key: 'quote', page: 'custom', hash: '#demande' },
  { key: 'contact', page: 'contact', current: true },
];

export function Brand({ locale }: { locale: Locale }) {
  return (
    <Link href={href(locale, 'home')} className="brand" aria-label="Samarcande Voyage">
      {/* Logo officiel : turquoise (thème clair) et turquoise clair (thème sombre). */}
      <img className="brand__logo brand__logo--light" src={asset('/brand/logo.svg')} alt="" width={1968} height={361} decoding="async" />
      <img className="brand__logo brand__logo--dark" src={asset('/brand/logo-dark.svg')} alt="" width={1968} height={361} decoding="async" />
    </Link>
  );
}

function useTheme(pathname: string) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Au changement de langue, React recrée <html> (nouvelle mise en page) et efface data-theme :
  // on remet le thème choisi avant l'affichage, sinon le site repasse en clair.
  useLayoutEffect(() => {
    const root = document.documentElement;
    let saved: string | null = null;
    try { saved = localStorage.getItem('sv-theme'); } catch { /* navigation privée */ }
    const next = saved === 'dark' || saved === 'light'
      ? saved
      : root.dataset.theme === 'dark' || (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    if (root.dataset.theme !== next) root.dataset.theme = next;
    setTheme(next);
  }, [pathname]);
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
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const { theme, toggle } = useTheme(pathname);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setStuck(y > 12);
        // En mode « une section par écran » et sur téléphone/tablette,
        // l'en-tête ne se cache jamais : pas de va-et-vient au défilement.
        const paging = document.documentElement.classList.contains('paging-on');
        const compact = window.matchMedia('(max-width: 1119px)').matches;
        setHidden(!paging && !compact && y > 480 && y > last + 4);
        if (y < last - 4) setHidden(false);
        last = y;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { setLangOpen(false); }, [pathname]);

  // Téléphone : la rubrique active est ramenée au centre de la rangée défilante.
  useEffect(() => {
    const list = navRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLangOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const onDoc = (e: MouseEvent) => { if (!langRef.current?.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [langOpen]);

  const isCurrent = (page: PageKey) =>
    current?.route.page === page
    || (page === 'destinations' && current?.route.page === 'city')
    || (page === 'dates' && current?.route.page === 'booking');

  const setLangPref = (l: Locale) => { try { localStorage.setItem('sv-lang', l); } catch { /* */ } };

  return (
    <header className={`hdr${stuck || !isHome ? ' is-stuck' : ''}${hidden ? ' is-hidden' : ''}`}>
      <div className="wrap hdr__in">
        <Brand locale={locale} />
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
          <Link href={`${href(locale, 'custom')}#calcul`} className="btn btn--primary btn--sm hdr__cta">{labels.quote}</Link>
        </div>
      </div>

      <nav className="navbar" aria-label={labels.menu}>
        <div className="wrap navbar__in">
          <ul ref={navRef} data-native-scroll="">
            {NAV.map((n) => (
              <li key={n.key} className={n.key === 'quote' ? 'navbar__quote' : undefined}>
                <Link href={`${href(locale, n.page)}${n.hash ?? ''}`}
                  aria-current={n.current && isCurrent(n.page) ? 'page' : undefined}>
                  {labels.nav[n.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
