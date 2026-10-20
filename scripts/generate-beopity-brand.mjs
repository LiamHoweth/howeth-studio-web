import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// Web derivatives of the two approved artworks in design/branding/. The originals
// stay untouched; every output here can be regenerated with `npm run generate:brand`.
const root = new URL('../', import.meta.url);
const source = (name) => new URL(`design/branding/${name}`, root).pathname;
const out = (name) => new URL(`public/beopity/${name}`, root).pathname;
const LOGO = source('beopity-black-cat-logo.png');
const AVATAR = source('beopity-tiktok-pfp.png');
const PAPER = [209, 236, 203];

async function rgb(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const distance = (data, i, paper = PAPER) => Math.hypot(data[i] - paper[0], data[i + 1] - paper[1], data[i + 2] - paper[2]);

/**
 * Removes the paper around a drawing. Only paper connected to the border becomes
 * transparent, so enclosed pale details such as the mint eyes stay opaque. Edge
 * colours are un-premultiplied against the paper so no mint halo remains.
 */
function cutout({ data, width }, box, { flood = 46, soft = 92 } = {}) {
  const w = box.right - box.left, h = box.bottom - box.top;
  const background = new Uint8Array(w * h);
  const queue = [];
  const index = (x, y) => ((y + box.top) * width + x + box.left) * 3;
  const visit = (x, y) => {
    const k = y * w + x;
    if (background[k] || distance(data, index(x, y)) > flood) return;
    background[k] = 1; queue.push(k);
  };
  for (let x = 0; x < w; x++) { visit(x, 0); visit(x, h - 1); }
  for (let y = 0; y < h; y++) { visit(0, y); visit(w - 1, y); }
  while (queue.length) {
    const k = queue.pop(), x = k % w, y = (k - x) / w;
    if (x > 0) visit(x - 1, y); if (x < w - 1) visit(x + 1, y);
    if (y > 0) visit(x, y - 1); if (y < h - 1) visit(x, y + 1);
  }
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = y * w + x, i = index(x, y), o = k * 4;
    // Pixels beside the paper fade by colour distance; the interior is solid.
    let nearPaper = background[k];
    if (!nearPaper) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && background[ny * w + nx]) { nearPaper = 1; break; }
    }
    const alpha = nearPaper ? Math.min(1, Math.max(0, (distance(data, i) - flood * 0.5) / (soft - flood * 0.5))) : 1;
    for (let c = 0; c < 3; c++) {
      const value = alpha > 0.02 ? (data[i + c] - (1 - alpha) * PAPER[c]) / alpha : 0;
      rgba[o + c] = Math.round(Math.min(255, Math.max(0, value)));
    }
    rgba[o + 3] = Math.round(alpha * 255);
  }
  return sharp(rgba, { raw: { width: w, height: h, channels: 4 } });
}

/** The wordmark becomes a white alpha mask so CSS can colour it for any surface. */
function wordmarkMask({ data, width }, box) {
  const w = box.right - box.left, h = box.bottom - box.top;
  const rgba = Buffer.alloc(w * h * 4, 255);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = ((y + box.top) * width + x + box.left) * 3;
    const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    // Paper is ~228, ink ~38. A gentle ramp keeps the anti-aliased edge.
    let alpha = Math.min(1, Math.max(0, (205 - luminance) / 150));
    // The kitten's paws sit just above the letters between x 400 and 880.
    if (y + box.top < 935 && x + box.left > 400 && x + box.left < 880) alpha = 0;
    rgba[(y * w + x) * 4 + 3] = Math.round(alpha * 255);
  }
  return sharp(rgba, { raw: { width: w, height: h, channels: 4 } });
}

await mkdir(out(''), { recursive: true });
const logo = await rgb(LOGO);

// Full approved lockup for studio art and the footer.
await sharp(LOGO).resize(1080).webp({ quality: 88 }).toFile(out('logo.webp'));
// Mascot only: the seated kitten without the wordmark, on transparency.
await cutout(logo, { left: 290, top: 40, right: 1060, bottom: 902 }).trim().resize({ height: 640 })
  .webp({ quality: 90, alphaQuality: 95 }).toFile(out('cat-sitting.webp'));
// Exact approved wordmark as a recolourable mask.
await wordmarkMask(logo, { left: 210, top: 896, right: 1050, bottom: 1180 }).trim()
  .png({ compressionLevel: 9 }).toFile(out('wordmark.png'));
// Paper grain from an empty corner, mirrored 2×2 so it tiles without seams.
const grain = await sharp(LOGO).extract({ left: 24, top: 24, width: 240, height: 240 }).toBuffer();
await sharp({ create: { width: 480, height: 480, channels: 3, background: '#000' } })
  .composite([
    { input: grain, left: 0, top: 0 },
    { input: await sharp(grain).flop().toBuffer(), left: 240, top: 0 },
    { input: await sharp(grain).flip().toBuffer(), left: 0, top: 240 },
    { input: await sharp(grain).flip().flop().toBuffer(), left: 240, top: 240 },
  ])
  .webp({ quality: 80 }).toFile(out('paper.webp'));

// Close-up portrait for small surfaces: header mark, favicon, touch icon.
const face = { left: 300, top: 172, width: 660, height: 660 };
await sharp(AVATAR).extract(face).resize(256).webp({ quality: 90 }).toFile(out('avatar.webp'));
for (const [name, size] of [['favicon.png', 48], ['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await sharp(AVATAR).extract(face).resize(size).png({ palette: size > 64, quality: 92, compressionLevel: 9 }).toFile(out(name));
}

// Social card: approved lockup centred on extended paper.
const lockup = await sharp(LOGO).resize(630).toBuffer();
const paperTile = await sharp(LOGO).extract({ left: 0, top: 0, width: 300, height: 630 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: { r: PAPER[0], g: PAPER[1], b: PAPER[2] } } })
  .composite([
    { input: paperTile, left: 0, top: 0 },
    { input: await sharp(paperTile).flop().toBuffer(), left: 900, top: 0 },
    { input: lockup, left: 285, top: 0 },
  ])
  .png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(out('social.png'));

console.log('Beopity brand assets written to public/beopity/');
