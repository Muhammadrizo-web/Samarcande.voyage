'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { UI } from '@/content/site';

/** Écrans « d'ordinateur » : assez larges et hauts pour qu'une section tienne entière. */
const FIT = '(min-width: 1024px) and (min-height: 600px)';
/** Souris ou pavé tactile : on exclut téléphones et tablettes (défilement au doigt). */
const FINE = '(hover: hover) and (pointer: fine)';
const REDUCE = '(prefers-reduced-motion: reduce)';

/** Silence minimal entre deux gestes : absorbe l'inertie des pavés tactiles. */
const GESTURE_GAP = 170;
/** Seuil de déclenchement : ignore les micro-mouvements du pavé tactile. */
const MIN_DELTA = 24;

type Seg = { el: HTMLElement | null; top: number; bottom: number };
type Mode = 'page' | 'curtain' | 'none';

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Sections plein écran sur ordinateur.
 *
 * Mode « page » (par défaut) : un cran de molette, un geste de pavé tactile, PageDown,
 * flèche ou espace = exactement une section, avec une prolongation fluide et régulière.
 * Une section plus haute que l'écran (petit portable, zoom du navigateur) se lit d'abord
 * par pas jusqu'à son bas, puis on passe à la suivante : rien n'est jamais sauté.
 * Désactivé au doigt (téléphone, tablette), sur les petits écrans, si l'utilisateur
 * limite les animations, et sur les pages qui ne commencent pas par un écran (formulaires).
 *
 * Indicateur à droite « 03 / 09 », cliquable, dans tous les modes.
 */
export function Screens({ label }: { label: string }) {
  const pathname = usePathname();
  const [items, setItems] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState(false);
  const api = useRef<{ goTo: (i: number) => void }>({ goTo: () => {} });

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1800);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    const list = Array.from(document.querySelectorAll<HTMLElement>('main [data-screen]'));
    setItems(list.map((el) => el.dataset.screen || ''));
    setActive(0);
    if (!list.length) return;

    const root = document.documentElement;
    const mqFit = window.matchMedia(FIT);
    const mqFine = window.matchMedia(FINE);
    const mqReduce = window.matchMedia(REDUCE);
    const startsWithScreen = list[0]!.parentElement?.firstElementChild === list[0];

    let mode: Mode = 'none';
    let segs: Seg[] = [];
    let animating = false;
    let raf = 0;
    let scrollRaf = 0;
    let lastWheel = 0;
    let consumed = false;
    let accum = 0;
    let arriveTimer = 0;

    const pickMode = (): Mode => {
      if (list.length < 2 || !mqFit.matches) return 'none';
      if (UI.sectionMode === 'page' && mqFine.matches && !mqReduce.matches && startsWithScreen) return 'page';
      if (UI.sectionMode === 'curtain' && !mqReduce.matches) return 'curtain';
      return 'none';
    };

    /* ------------------------------------------------ mesures (mode page) */
    const measure = () => {
      segs = list.map((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { el, top, bottom: top + el.offsetHeight };
      });
      const lastBottom = segs[segs.length - 1]!.bottom;
      const docH = root.scrollHeight;
      // « queue » de page (bandeau d'appel + pied de page) : une dernière étape
      if (docH - lastBottom > 4) segs.push({ el: null, top: lastBottom, bottom: docH });
    };
    const maxScroll = () => root.scrollHeight - window.innerHeight;
    const indexAt = (y: number) => {
      let i = 0;
      segs.forEach((s, k) => { if (s.top <= y + 2) i = k; });
      return i;
    };

    const animateTo = (y: number, arriving?: HTMLElement | null) => {
      const start = window.scrollY;
      const target = Math.max(0, Math.min(maxScroll(), Math.round(y)));
      const dist = target - start;
      if (Math.abs(dist) < 1) return;
      const dur = Math.min(1050, Math.max(620, 480 + Math.abs(dist) * 0.38));
      animating = true;
      root.classList.add('is-paging');
      if (arriving) {
        window.clearTimeout(arriveTimer);
        list.forEach((el) => el.classList.remove('is-arriving'));
        arriving.classList.add('is-arriving');
        arriveTimer = window.setTimeout(() => arriving.classList.remove('is-arriving'), dur + 900);
      }
      const t0 = performance.now();
      cancelAnimationFrame(raf);
      const frame = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        window.scrollTo({ top: start + dist * ease(p), behavior: 'instant' });
        if (p < 1) raf = requestAnimationFrame(frame);
        else { animating = false; root.classList.remove('is-paging'); }
      };
      raf = requestAnimationFrame(frame);
    };

    /** Un pas vers le bas (+1) ou le haut (−1), en respectant les sections hautes. */
    const step = (dir: 1 | -1) => {
      measure(); // géométrie fraîche : polices, images et panneaux ont pu changer la hauteur
      const y = window.scrollY;
      const vh = window.innerHeight;
      const i = indexAt(y);
      const seg = segs[i]!;
      if (dir > 0) {
        const rest = seg.bottom - (y + vh);
        if (rest > 2) return animateTo(y + Math.min(rest, vh * 0.85));
        const next = segs[i + 1];
        if (next) animateTo(next.top, next.el);
      } else {
        const above = y - seg.top;
        if (above > 2) return animateTo(y - Math.min(above, vh * 0.85));
        const prev = segs[i - 1];
        if (prev) animateTo(Math.max(prev.top, prev.bottom - vh), prev.el);
      }
    };

    /* ------------------------------------------------ molette et pavé tactile */
    const onWheel = (e: WheelEvent) => {
      if (mode !== 'page' || e.ctrlKey || e.defaultPrevented) return;
      const t = e.target as Element | null;
      if (t?.closest?.('textarea, select, .lang__menu, .drawer.is-open, [data-native-scroll]')) return;
      const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const dy = e.deltaY * k;
      const dx = e.deltaX * k;
      if (Math.abs(dx) > Math.abs(dy) || e.shiftKey) return; // geste horizontal (galerie, bandeau)
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel > GESTURE_GAP) { consumed = false; accum = 0; }
      lastWheel = now;
      if (animating || consumed) return;
      accum += dy;
      if (Math.abs(accum) < MIN_DELTA) return;
      consumed = true;
      step(accum > 0 ? 1 : -1);
    };

    /* ------------------------------------------------ clavier */
    const onKey = (e: KeyboardEvent) => {
      if (mode !== 'page' || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"], [role="tablist"], [role="radiogroup"], [role="menu"], .drawer.is-open')) return;
      let dir: 1 | -1 | 0 = 0;
      if (e.key === 'PageDown' || e.key === 'ArrowDown') dir = 1;
      if (e.key === 'PageUp' || e.key === 'ArrowUp') dir = -1;
      if (e.key === ' ') {
        if (t?.closest('button, a, [role="button"], summary')) return;
        dir = e.shiftKey ? -1 : 1;
      }
      if (e.key === 'Home') { e.preventDefault(); if (!animating) animateTo(0, list[0]); return; }
      if (e.key === 'End') { e.preventDefault(); if (!animating) animateTo(maxScroll()); return; }
      if (!dir) return;
      e.preventDefault();
      if (!animating) step(dir);
    };

    /* ------------------------------------------------ rideau (mode curtain) */
    const curtainLayout = () => {
      for (const el of list) el.style.top = mode === 'curtain' ? `${Math.min(0, window.innerHeight - el.offsetHeight)}px` : '';
    };

    /* ------------------------------------------------ indicateur + rideau au défilement */
    const tick = () => {
      const vh = window.innerHeight;
      let act = 0;
      list.forEach((el, i) => {
        if (i > 0 && el.getBoundingClientRect().top <= vh * 0.5) act = i;
        if (mode !== 'curtain') return;
        const next = el.nextElementSibling as HTMLElement | null;
        const p = next ? Math.min(1, Math.max(0, (vh - next.getBoundingClientRect().top) / vh)) : 0;
        el.style.setProperty('--p', p.toFixed(3));
      });
      setActive(act);
    };
    const onScroll = () => { cancelAnimationFrame(scrollRaf); scrollRaf = requestAnimationFrame(tick); };

    /* ------------------------------------------------ mise en place */
    let resizeTimer = 0;
    const setup = (realign = false) => {
      const prevMode = mode;
      mode = pickMode();
      root.classList.toggle('paging-on', mode === 'page');
      root.classList.toggle('stack-on', mode === 'curtain');
      if (mode !== 'curtain') list.forEach((el) => { el.style.top = ''; el.style.removeProperty('--p'); });
      curtainLayout();
      if (mode === 'page') {
        const before = realign && prevMode === 'page' && segs.length ? indexAt(window.scrollY) : -1;
        measure();
        // après un redimensionnement, on se recale proprement sur la section en cours
        if (before >= 0 && segs[before]) window.scrollTo({ top: Math.min(maxScroll(), segs[before]!.top), behavior: 'instant' });
      }
      tick();
    };
    const onResize = () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => setup(true), 140); };
    const ro = new ResizeObserver(() => { if (!animating && mode === 'page') measure(); });
    list.forEach((el) => ro.observe(el));

    api.current.goTo = (i: number) => {
      const el = list[i];
      if (!el) return;
      if (mode === 'page') { measure(); animateTo(segs[i]!.top, el); return; }
      let y = el.parentElement!.getBoundingClientRect().top + window.scrollY;
      for (let n = el.parentElement!.firstElementChild; n && n !== el; n = n.nextElementSibling) y += (n as HTMLElement).offsetHeight;
      window.scrollTo({ top: Math.max(0, y), behavior: mqReduce.matches ? 'auto' : 'smooth' });
    };

    setup();
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const onMq = () => setup();
    [mqFit, mqFine, mqReduce].forEach((m) => m.addEventListener('change', onMq));

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(arriveTimer);
      ro.disconnect();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      [mqFit, mqFine, mqReduce].forEach((m) => m.removeEventListener('change', onMq));
      root.classList.remove('paging-on', 'stack-on', 'is-paging');
      list.forEach((el) => { el.style.top = ''; el.style.removeProperty('--p'); el.classList.remove('is-arriving'); });
    };
  }, [pathname]);

  if (items.length < 3) return null;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <nav className={`snav no-print${flash ? ' is-flash' : ''}`} aria-label={label}>
      <div className="snav__count" aria-hidden>
        <b key={active}>{pad(active + 1)}</b><span>/ {pad(items.length)}</span>
      </div>
      <ol>
        {items.map((l, i) => (
          <li key={i}>
            <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => api.current.goTo(i)}>
              <span className="snav__label">{l}</span>
              <span className="snav__tick" aria-hidden />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
