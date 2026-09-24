'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Arrow } from '../Icons';

/** Rangée défilante horizontale (galerie) avec boutons précédent / suivant. */
export function HScroll({ children, prev, next }: { children: ReactNode; prev: string; next: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  const by = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="hs">
      <div className="hs__btns">
        <button type="button" className="icon-btn hs__btn" onClick={() => by(-1)} disabled={edge.start} aria-label={prev}>
          <Arrow style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button type="button" className="icon-btn hs__btn" onClick={() => by(1)} disabled={edge.end} aria-label={next}>
          <Arrow />
        </button>
      </div>
      <div className="hs__track" ref={track} tabIndex={0}>{children}</div>
    </div>
  );
}
