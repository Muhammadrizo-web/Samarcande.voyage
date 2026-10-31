import { NEIGHBOUR_PATHS, STOP_XY, UZB_PATH } from '@/content/map.generated';
import { ROUTE } from '@/content/tour';
import type { Dictionary } from '@/i18n/fr';
import { plural } from '@/lib/format';
import { href, type Locale } from '@/lib/i18n';
import type { ExplorerStop } from './client/RouteExplorer';

const pt = (k: string): [number, number] => STOP_XY[k] ?? [0, 0];

/** Courbe douce passant par une suite de points (Catmull-Rom → Bézier). */
function smooth(points: [number, number][]): string {
  if (points.length < 2) return '';
  let d = `M${points[0]![0]} ${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]!.toFixed(1)} ${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)} ${c2[1]!.toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/* Placement des étiquettes (dx, dy, ancre) pour éviter les chevauchements */
const LABEL: Record<string, [number, number, 'start' | 'end' | 'middle']> = {
  tas: [16, -14, 'start'], sam: [18, 4, 'start'], shk: [16, 24, 'start'], yan: [0, -30, 'middle'],
  buk: [-16, 26, 'end'], khi: [-16, 22, 'end'], urg: [14, -16, 'start'],
};

/** Fond de carte rendu côté serveur (aucun coût JavaScript). */
export function MapLayers() {
  return (
    <>
      <g>{NEIGHBOUR_PATHS.map((d, i) => <path key={i} d={d} className="map__neigh" />)}</g>
      <path d={UZB_PATH} className="map__land" />
      <g className="map__compass" transform="translate(860 110)" fill="none" stroke="currentColor" strokeWidth="1">
        <circle r="16" opacity=".5" />
        <path d="M0 -24 L4 0 L0 24 L-4 0 Z" fill="currentColor" opacity=".35" />
        <text y="-30" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" stroke="none">N</text>
      </g>
    </>
  );
}

export const MAIN_PATH = smooth([pt('tas'), pt('sam'), pt('yan'), pt('buk'), pt('khi'), pt('urg')]);
export const SPUR_PATH = `M${pt('sam').join(' ')} Q ${pt('sam')[0] + 26} ${(pt('sam')[1] + pt('shk')[1]) / 2} ${pt('shk').join(' ')}`;

export function explorerStops(locale: Locale, t: Dictionary): ExplorerStop[] {
  return ROUTE.map((r) => {
    const [x, y] = pt(r.key);
    const [lx, ly, anchor] = LABEL[r.key] ?? [12, -10, 'start'];
    const page = r.key !== 'urg' ? t.cityPages[r.key] : null;
    const days = r.days.length > 1 ? `${r.days[0]}–${r.days[r.days.length - 1]}` : `${r.days[0] ?? ''}`;
    return {
      key: r.key, x, y, lx, ly, anchor,
      name: t.cities[r.key],
      sleep: r.nights > 0,
      nightsLabel: r.nights > 0 ? `${r.nights} ${plural(r.nights, locale, t.ui.nightForms)}` : t.route.pass,
      days,
      note: t.cityNote[r.key],
      text: page?.intro[0] ?? '',
      href: r.key !== 'urg' ? href(locale, { page: 'city', city: r.key }) : null,
    };
  });
}
