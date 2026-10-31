/**
 * Fonds photo des sections : versions larges, légèrement adoucies (les originaux font
 * 600–1200 px ; sous un voile, un léger flou masque l'agrandissement).
 * Usage : node scripts/build-backdrops.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'assets/photos';
const OUT = 'public/bg';
export const BACKDROPS = ['gk3', 'g8', 'city-tachkent', 'g2', 'hero'];
mkdirSync(OUT, { recursive: true });

for (const name of BACKDROPS) {
  for (const w of [900, 1600]) {
    const img = sharp(`${SRC}/${name}.jpg`).rotate().resize({ width: w, withoutEnlargement: false }).sharpen({ sigma: 0.6 });
    await img.clone().avif({ quality: 58 }).toFile(`${OUT}/${name}-${w}.avif`);
    await img.clone().webp({ quality: 82 }).toFile(`${OUT}/${name}-${w}.webp`);
  }
  console.log('✓', name);
}
