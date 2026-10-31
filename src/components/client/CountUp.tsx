'use client';

import { useEffect, useRef, useState } from 'react';
import { money } from '@/lib/format';
import { LOCALE_META, type Locale } from '@/lib/i18n';

/**
 * Nombre qui défile jusqu'à sa valeur :
 *  – à la première apparition à l'écran (s'il était hors écran au chargement) ;
 *  – à chaque changement de valeur ensuite (calculateur).
 * Le HTML initial contient toujours la valeur finale (SEO, sans JS).
 */
export function CountUp({ value, locale, kind = 'int', className, duration = 900 }: {
  value: number; locale: Locale; kind?: 'int' | 'money'; className?: string; duration?: number;
}) {
  const format = (n: number) => (kind === 'money' ? money(n, locale) : n.toLocaleString(LOCALE_META[locale].intl));
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const last = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const animate = (from: number, to: number) => {
      if (reduce || from === to) { setShown(to); return; }
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setShown(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 4))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    if (last.current !== null) {
      animate(last.current, value);
      last.current = value;
      return () => cancelAnimationFrame(raf);
    }

    last.current = value;
    const offscreen = el.getBoundingClientRect().top > window.innerHeight;
    if (reduce || !offscreen || !('IntersectionObserver' in window)) return;
    const start = Math.round(value * 0.6);
    const io = new IntersectionObserver(([en]) => {
      if (!en?.isIntersecting) return;
      io.disconnect();
      animate(start, value);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
