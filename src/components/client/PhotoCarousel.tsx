'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Arrow } from '../Icons';

/** Photos qui défilent (flèches précédent / suivant + glisser au doigt), légende synchronisée. */
export function PhotoCarousel({ slides, prev, next }: { slides: { node: ReactNode; caption: string }[]; prev: string; next: string }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const startX = useRef<number | null>(null);

  return (
    <>
      <div className="pc__track"
        onTouchStart={(e) => { startX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          if (startX.current == null) return;
          const dx = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          startX.current = null;
        }}>
        {slides.map((s, k) => (
          <div key={k} className={`pc__slide${k === i ? ' is-on' : ''}`} aria-hidden={k !== i}>{s.node}</div>
        ))}
      </div>
      <figcaption aria-live="polite">{slides[i]?.caption}</figcaption>
      <div className="pc__nav">
        <button type="button" className="pc__btn pc__btn--prev" aria-label={prev} onClick={() => go(-1)}><Arrow size={18} /></button>
        <span className="pc__count">{i + 1} / {n}</span>
        <button type="button" className="pc__btn" aria-label={next} onClick={() => go(1)}><Arrow size={18} /></button>
      </div>
    </>
  );
}
