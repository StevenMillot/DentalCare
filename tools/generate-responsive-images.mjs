/**
 * Génère les variantes responsive manquantes pour le srcset HTML.
 *
 * Usage : npm run images:responsive
 * Inclus dans : npm run deploy:prepare
 *
 * Comportement idempotent :
 * - Ne traite que les originaux (`photo.jpg`), jamais les variantes (`photo-360w.jpg`).
 * - Ignore un original si toutes ses variantes existent déjà.
 * - Ne régénère pas une variante déjà présente sur disque.
 *
 * Prérequis : Node.js, `npm install` (sharp).
 *
 * Vérifier ensuite : `npm run images:check`
 * Nettoyer les doublons : `npm run images:cleanup`
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  TARGETS,
  isOriginal,
  expectedVariantName,
  missingWidthsFor,
} from './responsive-images-config.mjs';

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
 * @param {string} dirRel
 * @param {string[]} allowedExts
 */
async function listOriginals(dirRel, allowedExts) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .filter((e) => isOriginal(e.name, allowedExts))
    .map((e) => ({
      name: e.name,
      abs: path.join(dirAbs, e.name),
      ext: path.extname(e.name).toLowerCase(),
    }));
}

/**
 * @param {string} dirRel
 */
async function listDirNames(dirRel) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  return new Set(entries.filter((e) => e.isFile()).map((e) => e.name));
}

/**
 * @param {string} inputAbs
 * @param {string} baseName
 * @param {number[]} widthsToCreate
 * @param {{ format: 'avif'|'jpeg', quality: number, ext: string, dirRel: string }} opts
 */
async function generateMissingVariants(inputAbs, baseName, widthsToCreate, opts) {
  const input = sharp(inputAbs, { failOn: 'none' });
  let created = 0;

  for (const w of widthsToCreate) {
    const variantName = expectedVariantName(baseName, w, opts.ext);
    const outAbs = path.join(ROOT, opts.dirRel, variantName);

    if (await exists(outAbs)) continue;

    const pipeline = input.clone().resize({ width: w, withoutEnlargement: true });

    if (opts.format === 'avif') {
      await pipeline.avif({ quality: opts.quality }).toFile(outAbs);
    } else {
      await pipeline.jpeg({ quality: opts.quality, mozjpeg: true }).toFile(outAbs);
    }
    created += 1;
  }

  return created;
}

async function main() {
  let totalCreated = 0;
  let totalSkippedComplete = 0;

  for (const target of TARGETS) {
    const existingNames = await listDirNames(target.dir);
    const originals = await listOriginals(target.dir, target.exts);
    let dirCreated = 0;
    let dirSkipped = 0;

    for (const file of originals) {
      const missing = missingWidthsFor(file.name, target.widths, file.ext, existingNames);

      if (missing.length === 0) {
        dirSkipped += 1;
        continue;
      }

      const created = await generateMissingVariants(file.abs, file.name, missing, {
        format: target.format,
        quality: target.quality,
        ext: file.ext,
        dirRel: target.dir,
      });

      dirCreated += created;
      for (const w of missing) {
        existingNames.add(expectedVariantName(file.name, w, file.ext));
      }
    }

    totalCreated += dirCreated;
    totalSkippedComplete += dirSkipped;

    const parts = [];
    if (dirSkipped) parts.push(`${dirSkipped} original(aux) déjà complet(s)`);
    if (dirCreated) parts.push(`${dirCreated} variante(s) créée(s)`);
    if (parts.length) console.log(`[${target.dir}] ${parts.join(', ')}`);
  }

  if (totalCreated === 0) {
    console.log('OK: aucune variante à créer (srcset déjà à jour).');
  } else {
    console.log(`OK: ${totalCreated} variante(s) générée(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
