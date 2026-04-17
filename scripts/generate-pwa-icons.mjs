import fs from 'node:fs';
import sharp from 'sharp';

const SOURCE_SVG = 'assets/logo-b-raphael-brochand.svg';

if (!fs.existsSync(SOURCE_SVG)) {
  throw new Error(`Source SVG not found: ${SOURCE_SVG}`);
}

const svgBuffer = fs.readFileSync(SOURCE_SVG);

async function renderSquarePng({ size, outPath }) {
  // Render SVG into a square canvas.
  // "contain" keeps aspect ratio; transparent background is fine for general icons.
  await sharp(svgBuffer, { density: 512 })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

async function renderMaskablePng({ size, outPath, bg = '#ffffff' }) {
  // Maskable icons need padding (safe zone). Use ~20% padding.
  const pad = Math.round(size * 0.2);
  const inner = size - pad * 2;
  const icon = await sharp(svgBuffer, { density: 512 })
    .resize(inner, inner, { fit: 'contain' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: icon, left: pad, top: pad }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

await Promise.all([
  renderSquarePng({ size: 180, outPath: 'apple-touch-icon.png' }),
  renderSquarePng({ size: 192, outPath: 'web-app-manifest-192x192.png' }),
  renderSquarePng({ size: 512, outPath: 'web-app-manifest-512x512.png' }),
  renderMaskablePng({ size: 192, outPath: 'web-app-manifest-192x192-maskable.png' }),
  renderMaskablePng({ size: 512, outPath: 'web-app-manifest-512x512-maskable.png' }),
]);

console.log('Generated PWA icons (apple-touch + manifest + maskable).');

