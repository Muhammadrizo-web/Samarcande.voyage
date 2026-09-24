'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Bed, Calendar } from '../Icons';

export type ExplorerStop = {
  key: string;
  x: number;
  y: number;
  name: string;
  nightsLabel: string;
  sleep: boolean;
  days: string;
  note: string;
  text: string;
  href: string | null;
  lx: number;
  ly: number;
  anchor: 'start' | 'end' | 'middle';
};

type Labels = { mapLabel: string; hint: string; reset: string; overview: string; more: string; daysLabel: string };

const FULL = { x: 20, y: 30, w: 960, h: 570 };
const ZOOM_W = 300;
const DURATION = 1150;

/** Courbe « caméra » : départ doux, arrivée très douce. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function targetFor(stop: ExplorerStop | undefined) {
  if (!stop) return FULL;
  const w = ZOOM_W, h = (ZOOM_W * FULL.h) / FULL.w;
  return { x: stop.x - w * 0.56, y: stop.y - h * 0.5, w, h };
}

/**
 * Carte de l'itinéraire interactive : choisir une étape (liste ou carte)
 * zoome la carte sur la ville et affiche sa fiche avec « En savoir plus ».
 * Les tracés (pays, voisins) arrivent déjà rendus côté serveur (`layers`).
 */
export function RouteExplorer({ stops, layers, mainPath, spurPath, labels, stats, photos, head, lead }: {
  stops: ExplorerStop[];
  layers: ReactNode;
  mainPath: string;
  spurPath: string;
  labels: Labels;
  stats: { v: string; l: string }[];
  photos: Partial<Record<string, ReactNode>>;
  head?: ReactNode;
  lead?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const view = useRef({ ...FULL });
  const raf = useRef(0);

  const apply = useCallback((v: { x: number; y: number; w: number; h: number }) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.setAttribute('viewBox', `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`);
    svg.style.setProperty('--k', (v.w / FULL.w).toFixed(4));
  }, []);

  useEffect(() => {
    const from = { ...view.current };
    const to = targetFor(stops.find((s) => s.key === active));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cancelAnimationFrame(raf.current);
    if (reduce) { view.current = to; apply(to); return; }
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const e = ease(p);
      const v = {
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
        w: from.w + (to.w - from.w) * e,
        h: from.h + (to.h - from.h) * e,
      };
      view.current = v;
      apply(v);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [active, stops, apply]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const current = stops.find((s) => s.key === active);
  const pick = (k: string) => setActive((a) => (a === k ? a : k));

  return (
    <div className={`rx${active ? ' is-zoomed' : ''}`}>
      <div className="rx__main">
      {head}
      <figure className="rx__map map" data-rv="fade">
        <svg ref={svgRef} viewBox={`${FULL.x} ${FULL.y} ${FULL.w} ${FULL.h}`} role="img" aria-label={labels.mapLabel} style={{ ['--k' as string]: 1 }}>
          {layers}
          <path d={mainPath} className="map__path" pathLength={1} />
          <path d={spurPath} className="map__path map__path--spur" />
          {stops.map((s, i) => (
            <g key={s.key} transform={`translate(${s.x} ${s.y})`}
              className={`map__stop${s.sleep ? ' sleep' : ''}${s.key === active ? ' is-active' : ''}${active && s.key !== active ? ' is-dim' : ''}`}
              style={{ ['--i' as string]: i }}
              role="button" tabIndex={0} aria-label={s.name} aria-pressed={s.key === active}
              onClick={() => pick(s.key)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(s.key); } }}>
              <g className="map__stopin">
                <circle className="hit" r={16} />
                <circle className="halo" r={6} />
                <circle className="dot" r={s.sleep ? 6.5 : 5} />
                <text x={s.lx} y={s.ly} textAnchor={s.anchor}>{s.name}</text>
                <text className="n" x={s.lx} y={s.ly + 20} textAnchor={s.anchor}>{s.nightsLabel}</text>
              </g>
            </g>
          ))}
        </svg>

        {current && photos[current.key] && (
          <div className="rx__photo" key={current.key} aria-hidden>
            {photos[current.key]}
            <span>{current.name}</span>
          </div>
        )}
        <button type="button" className="rx__reset btn btn--line btn--sm" onClick={() => setActive(null)} hidden={!active}>
          <span aria-hidden>↺</span> {labels.reset}
        </button>
      </figure>
      </div>

      <div className="rx__side">
        <ol className="rx__list" aria-label={labels.hint}>
          {stops.map((s, i) => (
            <li key={s.key}>
              <button type="button" aria-pressed={s.key === active} onClick={() => pick(s.key)}>
                <span className="i">{String(i + 1).padStart(2, '0')}</span>
                <b>{s.name}</b>
                <span className="n">{s.nightsLabel}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="rx__panel" key={active ?? 'overview'} aria-live="polite">
          {current ? (
            <>
              <div className="rx__meta">
                <span><Calendar /> {labels.daysLabel} {current.days}</span>
                <span><Bed /> {current.nightsLabel}</span>
              </div>
              <h3 className="h3">{current.name}</h3>
              <p className="rx__note">{current.note}</p>
              {current.text && <p className="rx__text">{current.text}</p>}
              {current.href && (
                <Link href={current.href} className="btn btn--primary btn--sm rx__more">{labels.more} <ArrowUpRight /></Link>
              )}
            </>
          ) : (
            <>
              {lead && <p className="rx__lead">{lead}</p>}
              <span className="eyebrow">{labels.overview}</span>
              <div className="rx__stats">
                {stats.map((s) => <div key={s.l}><b>{s.v}</b><span>{s.l}</span></div>)}
              </div>
              <p className="rx__hint">{labels.hint}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
