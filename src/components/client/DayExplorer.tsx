'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Arrow, Bed, Printer } from '../Icons';

type Day = { t: string; d: string; n: string; m: string; km?: number };

/**
 * Programme en « liste + fiche » : 12 jours à gauche, la journée choisie à droite.
 * Tout le texte des 12 jours est dans le HTML (référencement, impression) ;
 * seule la fiche active est affichée à l'écran. Ancre #day-N prise en charge.
 */
export function DayExplorer({ days, photos, labels, head }: {
  days: Day[];
  photos: (ReactNode | null)[];
  labels: { day: string; night: string; pick: string; print: string; prev: string; next: string };
  head?: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = () => {
      const m = /^#day-(\d{1,2})$/.exec(window.location.hash);
      if (!m) return;
      const n = Math.max(1, Math.min(days.length, Number(m[1]))) - 1;
      setActive(n);
      rootRef.current?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [days.length]);

  const go = (i: number, focus = false) => {
    const n = (i + days.length) % days.length;
    setActive(n);
    if (focus) listRef.current?.querySelectorAll<HTMLButtonElement>('button')[n]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(active + 1, true); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1, true); }
    if (e.key === 'Home') { e.preventDefault(); go(0, true); }
    if (e.key === 'End') { e.preventDefault(); go(days.length - 1, true); }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="dx" ref={rootRef}>
      <div className="dx__aside">
        {head}
        <ol className="dx__list" ref={listRef} role="tablist" aria-orientation="vertical" aria-label={labels.pick} onKeyDown={onKey}>
          {days.map((d, i) => (
            <li key={i} role="presentation">
              <button type="button" role="tab" id={`dx-tab-${i}`} aria-controls={`day-${i + 1}`}
                aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => go(i)}>
                <span className="dx__n">{pad(i + 1)}</span>
                <span className="dx__t" title={d.t}>{d.t}</span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="link-arrow dx__print no-print" onClick={() => { window.print(); }}>
          <Printer /> {labels.print}
        </button>
      </div>

      <div className="dx__stage">
        {days.map((d, i) => (
          <article key={i} id={`day-${i + 1}`} role="tabpanel" aria-labelledby={`dx-tab-${i}`}
            className="dx__panel" hidden={i !== active}>
            <div className="dx__media frame">
              {photos[i] ?? <div className="dx__pattern" aria-hidden><span>{pad(i + 1)}</span></div>}
            </div>
            <div className="dx__body">
              <span className="eyebrow">{labels.day} {pad(i + 1)} / {pad(days.length)}</span>
              <h3 className="h2 dx__title">{d.t}</h3>
              <div className="dx__meta">
                <span><Bed /> {labels.night} : {d.n}</span>
                <span>{d.m}</span>
                {d.km ? <span>≈ {d.km} km</span> : null}
              </div>
              <p className="dx__text">{d.d}</p>
              <div className="dx__nav no-print">
                <button type="button" className="btn btn--line btn--sm" onClick={() => go(i - 1)}>
                  <Arrow style={{ transform: 'rotate(180deg)' }} /> {labels.day} {pad(((i - 1 + days.length) % days.length) + 1)}
                </button>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => go(i + 1)}>
                  {labels.day} {pad(((i + 1) % days.length) + 1)} <Arrow />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
