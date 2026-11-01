'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Arrow, Bed, Printer } from '../Icons';

/** `from`/`to` : numéros de jours couverts (plusieurs jours regroupés en une fiche) ; `parts` : texte jour par jour. */
type Day = { t: string; d: string; n: string; m: string; km?: number; from?: number; to?: number; parts?: { day: number; d: string }[] };

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
  const pad = (n: number) => String(n).padStart(2, '0');
  const first = (i: number) => days[i]?.from ?? i + 1;
  const label = (i: number) => {
    const a = first(i); const b = days[i]?.to ?? a;
    return b > a ? `${pad(a)}–${pad(b)}` : pad(a);
  };
  const total = days.reduce((m, d, i) => Math.max(m, d.to ?? d.from ?? i + 1), 0);
  const listRef = useRef<HTMLOListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = () => {
      const m = /^#day-(\d{1,2})$/.exec(window.location.hash);
      if (!m) return;
      const day = Number(m[1]);
      const n = days.findIndex((d, i) => day >= (d.from ?? i + 1) && day <= (d.to ?? d.from ?? i + 1));
      if (n < 0) return;
      setActive(n);
      rootRef.current?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [days]);

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

  return (
    <div className="dx" ref={rootRef}>
      <div className="dx__aside">
        {head}
        <ol className="dx__list" ref={listRef} role="tablist" aria-orientation="vertical" aria-label={labels.pick} onKeyDown={onKey}>
          {days.map((d, i) => (
            <li key={i} role="presentation">
              <button type="button" role="tab" id={`dx-tab-${i}`} aria-controls={`day-${first(i)}`}
                aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => go(i)}>
                <span className="dx__n">{label(i)}</span>
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
          <article key={i} id={`day-${first(i)}`} role="tabpanel" aria-labelledby={`dx-tab-${i}`}
            className="dx__panel" hidden={i !== active}>
            <div className="dx__media frame">
              {photos[i] ?? <div className="dx__pattern" aria-hidden><span>{label(i)}</span></div>}
            </div>
            <div className="dx__body">
              <span className="eyebrow">{labels.day} {label(i)} / {pad(total)}</span>
              <h3 className="h2 dx__title">{d.t}</h3>
              <div className="dx__meta">
                <span><Bed /> {labels.night} : {d.n}</span>
                <span>{d.m}</span>
                {d.km ? <span>≈ {d.km} km</span> : null}
              </div>
              {d.parts ? (
                <div className="dx__parts">
                  {d.parts.map((p) => <p key={p.day} className="dx__text"><b>{labels.day} {pad(p.day)}.</b> {p.d}</p>)}
                </div>
              ) : <p className="dx__text">{d.d}</p>}
              <div className="dx__nav no-print">
                <button type="button" className="btn btn--line btn--sm" onClick={() => go(i - 1)}>
                  <Arrow style={{ transform: 'rotate(180deg)' }} /> {labels.day} {label((i - 1 + days.length) % days.length)}
                </button>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => go(i + 1)}>
                  {labels.day} {label((i + 1) % days.length)} <Arrow />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
