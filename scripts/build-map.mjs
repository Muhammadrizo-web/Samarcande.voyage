// Génère le tracé SVG de l'Ouzbékistan + coordonnées projetées des étapes.
// Usage : node scripts/build-map.mjs  → src/content/map.generated.ts
import fs from 'node:fs';
import { feature } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';

const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const coarse = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'));
const countries = feature(topo, topo.objects.countries).features;
const coarseCountries = feature(coarse, coarse.objects.countries).features;
const uzb = countries.find((f) => f.id === '860');
// Voisins : tracé grossier (110m), découpé autour de la vue — ils ne servent que de contexte.
const neighbours = ['398', '795', '762', '417', '004'].map((id) => coarseCountries.find((f) => f.id === id)).filter(Boolean);

const W = 1000, H = 620;
const proj = geoMercator().fitExtent([[40, 40], [W - 40, H - 40]], uzb);
const path = geoPath(proj);
const clipped = geoMercator().fitExtent([[40, 40], [W - 40, H - 40]], uzb).clipExtent([[-260, -200], [W + 260, H + 200]]);
const pathClipped = geoPath(clipped);
const r = (n) => Math.round(n * 10) / 10;
const round = (d) => d.replace(/-?\d+\.\d+/g, (m) => String(r(+m)));

const stops = {
  tas: [69.2401, 41.2995], sam: [66.9597, 39.6542], shk: [66.8342, 39.0578],
  yan: [65.45, 40.68], buk: [64.4286, 39.7747], khi: [60.3639, 41.3783], urg: [60.6333, 41.55],
  nur: [65.6886, 40.5614], vob: [64.5167, 40.0167]
};
const pts = Object.fromEntries(Object.entries(stops).map(([k, ll]) => { const [x, y] = proj(ll); return [k, [r(x), r(y)]]; }));

const out = `/* Fichier généré par scripts/build-map.mjs — ne pas éditer à la main. */
export const MAP_W = ${W};
export const MAP_H = ${H};
export const UZB_PATH = ${JSON.stringify(round(path(uzb)))};
export const NEIGHBOUR_PATHS: string[] = ${JSON.stringify(neighbours.map((n) => round(pathClipped(n) || '')).filter(Boolean))};
export const STOP_XY: Record<string, [number, number]> = ${JSON.stringify(pts)};
`;
fs.writeFileSync('src/content/map.generated.ts', out);
console.log('ok', pts, 'uzb path length', path(uzb).length);
