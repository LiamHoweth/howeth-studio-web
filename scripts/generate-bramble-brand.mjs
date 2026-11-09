import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';

// Raster brand assets for Bramble, the beopity wandering house. Sources are the
// hand-ported SVGs in design/branding/bramble/ (mirrors of
// components/studio/art/Bramble.tsx). Every output can be regenerated with
// `npm run generate:bramble`; the older cat-era files in public/beopity/ are left alone.
const root = new URL('../', import.meta.url);
const source = (name) => new URL(`design/branding/bramble/${name}`, root).pathname;
const out = (name) => new URL(`public/beopity/${name}`, root).pathname;

const CREAM = '#f6efdc';
const DUSK = '#2a3550';
const SHADOW = { r: 18, g: 22, b: 38, alpha: 0.55 };
const TAGLINE = 'Independent apps &amp; games';
// Pango renders the tagline from this exact font file so the result never depends on
// fontconfig fallbacks. Elsewhere the tagline is skipped rather than set in a stand-in.
const TAGLINE_FONT = { file: '/System/Library/Fonts/Avenir Next.ttc', name: 'Avenir Next Demi Bold 25' };

/**
 * Rasterises an SVG so its width lands on `width` px with no resampling blur, and
 * returns a fresh sharp pipeline over the PNG (so later resizes cannot fight this one).
 */
async function render(svgPath, width, { svg } = {}) {
  const input = svg ? Buffer.from(svg) : svgPath;
  const { width: native } = await sharp(input).metadata();
  const png = await sharp(input, { density: (72 * width) / native }).resize({ width }).png().toBuffer();
  return sharp(png);
}

/** The badge with its sky disc swapped for a full square, for opaque touch icons. */
async function squareMarkSvg() {
  const svg = await readFile(source('bramble-mark.svg'), 'utf8');
  const square = svg.replaceAll('<circle cx="32" cy="32" r="32"', '<rect width="64" height="64"');
  if (square === svg) throw new Error('bramble-mark.svg: sky disc not found; update squareMarkSvg()');
  return square;
}

/** Fills an alpha mask with one colour (alpha multiplies), as a PNG buffer. */
async function tint(mask, background) {
  const { width, height } = await sharp(mask).metadata();
  return sharp({ create: { width, height, channels: 4, background } })
    .composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

/** A soft dusk-blue shadow of a mask, padded by `pad` px so the blur is not clipped. */
async function softShadow(mask, pad = 24, sigma = 7) {
  const padded = await sharp(mask)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(await tint(padded, SHADOW)).blur(sigma).png().toBuffer();
}

async function tagline() {
  if (!existsSync(TAGLINE_FONT.file)) {
    console.warn(`! ${TAGLINE_FONT.file} not found; social card rendered without the tagline.`);
    return null;
  }
  return sharp({
    text: {
      text: `<span foreground="white" letter_spacing="600">${TAGLINE}</span>`,
      font: TAGLINE_FONT.name, fontfile: TAGLINE_FONT.file, rgba: true, dpi: 96,
    },
  }).png().toBuffer();
}

const mark = source('bramble-mark.svg');
const markSmall = source('bramble-mark-small.svg');

// Favicon: the simplified badge stays legible at 48 px (transparent corners).
await (await render(markSmall, 48)).png({ compressionLevel: 9 }).toFile(out('bramble-favicon.png'));

// PWA / Android icons: the full badge on transparency.
for (const size of [192, 512]) {
  await (await render(mark, size)).png({ palette: true, quality: 95, compressionLevel: 9 })
    .toFile(out(`bramble-icon-${size}.png`));
}

// Apple touch icon: iOS rounds the corners itself and wants no alpha, so the sky runs
// edge to edge and anything left is flattened onto the dusk blue.
await (await render(null, 180, { svg: await squareMarkSvg() }))
  .flatten({ background: DUSK }).removeAlpha().png({ compressionLevel: 9 })
  .toFile(out('bramble-apple-touch-icon.png'));

// Mascot and badge for in-page fallbacks (404, no-JS, link previews inside the site).
const mascot = await (await render(source('bramble.svg'), 900)).trim({ threshold: 1 }).png().toBuffer();
await sharp(mascot).resize({ height: 600 })
  .webp({ quality: 90, alphaQuality: 95, effort: 6 }).toFile(out('bramble.webp'));
await (await render(mark, 256)).webp({ quality: 92, alphaQuality: 95, effort: 6 }).toFile(out('bramble-mark.webp'));

// Open Graph card: painted dusk scene + cream wordmark and tagline, each lifted off
// the sky by a soft shadow, on the clear left side.
const WORDMARK = { left: 92, top: 190, width: 470 };
const layers = [];
const addLettering = async (mask, left, top, pad, sigma) => {
  layers.push({ input: await softShadow(mask, pad, sigma), left: left - pad, top: top - pad + 3 });
  layers.push({ input: await tint(mask, CREAM), left, top });
};
const wordmarkMask = await sharp(out('wordmark.png')).resize({ width: WORDMARK.width }).png().toBuffer();
const { height: wordmarkHeight } = await sharp(wordmarkMask).metadata();
await addLettering(wordmarkMask, WORDMARK.left, WORDMARK.top, 24, 7);
const line = await tagline();
if (line) await addLettering(line, WORDMARK.left + 6, WORDMARK.top + wordmarkHeight + 28, 12, 3);
const scene = await (await render(source('social.svg'), 1200)).png().toBuffer();
await sharp(scene).composite(layers).removeAlpha()
  .png({ palette: true, colors: 256, quality: 100, dither: 0.6, compressionLevel: 9, effort: 10 })
  .toFile(out('bramble-social.png'));

// Report what was written so a run doubles as a dimension check.
for (const name of ['bramble-favicon.png', 'bramble-icon-192.png', 'bramble-icon-512.png', 'bramble-apple-touch-icon.png',
  'bramble-social.png', 'bramble.webp', 'bramble-mark.webp']) {
  const { width, height, format, hasAlpha } = await sharp(out(name)).metadata();
  const { size } = await stat(out(name));
  console.log(`${name.padEnd(30)} ${`${width}×${height}`.padEnd(10)} ${format.padEnd(5)} ${hasAlpha ? 'alpha ' : 'opaque'} ${(size / 1024).toFixed(1)} KB`);
}
console.log(line ? 'Social card includes the tagline.' : 'Social card has no tagline (font unavailable).');
