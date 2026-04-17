import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();

/**
 * @param {string} p
 */
async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} filePath
 */
function ext(filePath) {
  return path.extname(filePath).toLowerCase();
}

/**
 * @param {string} filePath
 */
function baseNoExt(filePath) {
  return filePath.slice(0, -path.extname(filePath).length);
}

/**
 * @param {string} inputAbs
 * @param {number[]} widths
 * @param {object} options
 * @param {'avif'|'jpeg'} options.format
 * @param {number} options.quality
 */
async function generateVariants(inputAbs, widths, { format, quality }) {
  const rel = path.relative(ROOT, inputAbs);
  const inputExt = ext(rel);
  const outExt = format === 'jpeg' ? '.jpg' : '.avif';

  if (inputExt !== outExt) {
    // On garde les originaux (pas de conversion de format ici).
  }

  const input = sharp(inputAbs, { failOn: 'none' });

  for (const w of widths) {
    const outRel = `${baseNoExt(rel)}-${w}w${outExt}`;
    const outAbs = path.join(ROOT, outRel);
    if (await exists(outAbs)) continue;

    const pipeline = input
      .clone()
      .resize({ width: w, withoutEnlargement: true });

    if (format === 'avif') {
      await pipeline.avif({ quality }).toFile(outAbs);
    } else {
      await pipeline.jpeg({ quality, mozjpeg: true }).toFile(outAbs);
    }
  }
}

async function listFiles(dirRel, allowedExts) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  const reVariant = /-\d+w\.(?:avif|jpe?g)$/i;
  return entries
    .filter((e) => e.isFile())
    .map((e) => path.join(dirAbs, e.name))
    .filter((p) => allowedExts.includes(ext(p)))
    // Ne pas générer des "variants de variants" (ex: -960w-640w.*)
    .filter((p) => !reVariant.test(p));
}

async function main() {
  // Galerie cabinet (AVIF) : 240/480/640/960/1600
  const gallery = await listFiles('assets/cabinet-gallery', ['.avif']);
  for (const f of gallery) {
    await generateVariants(f, [240, 480, 640, 960, 1600], { format: 'avif', quality: 50 });
  }

  // Portraits équipe (JPG) : 360/540/720/1080
  const team = await listFiles('assets/team', ['.jpg', '.jpeg']);
  for (const f of team) {
    await generateVariants(f, [360, 540, 720, 1080], { format: 'jpeg', quality: 78 });
  }

  console.log('OK: variants générées');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

