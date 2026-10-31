// Photos sources (assets/photos/*.jpg) → public/img/<nom>-<largeur>.{avif,webp,jpg}
// + manifeste typé src/content/images.generated.ts (dimensions, largeurs, LQIP).
// Remplacer une photo : déposer le nouveau .jpg (même nom) dans assets/photos, relancer `npm run images`.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets/photos';
const OUT = 'public/img';
const WIDTHS = [480, 800, 1200, 1600, 2400];
fs.mkdirSync(OUT, { recursive: true });

const manifest = {};
for (const file of fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
  const name = path.parse(file).name;
  const img = sharp(path.join(SRC, file)).rotate();
  const { width, height } = await img.metadata();
  const widths = WIDTHS.filter((w) => w < width).concat(width).filter((v, i, a) => a.indexOf(v) === i);
  for (const w of widths) {
    const base = sharp(path.join(SRC, file)).rotate().resize({ width: w });
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`);
    await base.clone().webp({ quality: 74 }).toFile(`${OUT}/${name}-${w}.webp`);
    await base.clone().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(`${OUT}/${name}-${w}.jpg`);
  }
  const lqip = await sharp(path.join(SRC, file)).rotate().resize(16).blur(1.2).webp({ quality: 40 }).toBuffer();
  manifest[name] = { w: width, h: height, widths, lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
}

// Image Open Graph 1200×630 (sans texte : le titre vient des balises og:title)
await sharp(path.join(SRC, 'hero.jpg')).resize(1200, 630, { fit: 'cover', position: 'right' })
  .composite([{ input: Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#08141E" stop-opacity="0"/><stop offset="1" stop-color="#08141E" stop-opacity=".55"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <g transform="translate(64 520) scale(1.9)" fill="none" stroke="#F3E7C8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 2c6.6 0 11 4.9 11 11.5V38H6V13.5C6 6.9 10.4 2 17 2z"/><path d="M17 38V24c0-2.5 1.6-4 3.6-4S24 21.5 24 24v14"/><path d="M10 38V24c0-2.5 1.6-4 3.6-4"/>
    </g></svg>`), top: 0, left: 0 }])
  .jpeg({ quality: 82, mozjpeg: true }).toFile('public/og.jpg');

const ts = `/* Généré par scripts/optimize-images.mjs — ne pas éditer à la main. */
export type ImageMeta = { w: number; h: number; widths: number[]; lqip: string };
export const IMAGES = ${JSON.stringify(manifest, null, 2)} as const satisfies Record<string, ImageMeta>;
export type ImageName = keyof typeof IMAGES;
`;
fs.writeFileSync('src/content/images.generated.ts', ts);
console.log(Object.keys(manifest).length, 'images');
