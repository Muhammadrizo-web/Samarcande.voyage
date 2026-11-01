'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Un seul IntersectionObserver pour tout le site : les éléments [data-rv]
 * reçoivent .is-in quand ils entrent dans l'écran. Les frères [data-rv]
 * d'un même parent sont décalés (--rv-i) pour un effet de cascade discret.
 * Aucun élément n'est masqué sans JavaScript (classe .js posée dans <head>).
 */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    (window as unknown as { __rv?: boolean }).__rv = true;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-rv]:not(.is-in)'));
    if (!('IntersectionObserver' in window)) { nodes.forEach((n) => n.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const el = en.target as HTMLElement;
        const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-rv')) : [];
        el.style.setProperty('--rv-i', String(Math.min(Math.max(0, sibs.indexOf(el)), 5)));
        el.classList.add('is-in');
        io.unobserve(el);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    nodes.forEach((n) => io.observe(n));
    // Éléments [data-rv] remontés après coup (rechargement à chaud, composant client re-rendu) : on les observe aussi,
    // sinon ils restent bloqués dans leur état « caché » (ex. photo rognée sur les côtés).
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((a) => {
        if (!(a instanceof HTMLElement)) return;
        const found = a.matches('[data-rv]:not(.is-in)') ? [a] : [];
        found.concat(Array.from(a.querySelectorAll<HTMLElement>('[data-rv]:not(.is-in)'))).forEach((n) => io.observe(n));
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);
  return null;
}
