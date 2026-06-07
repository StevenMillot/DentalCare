/**
 * Supprime les variantes « en double » (fichiers corrompus par régénération).
 *
 * Exemple cible : `photo-1080w-360w.jpg` — jamais référencé dans le HTML.
 *
 * Usage : npm run images:cleanup
 * Inclus dans : npm run deploy:prepare
 *
 * Ne touche pas aux originaux ni aux variantes simples (photo-360w.jpg).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { TARGETS, RE_MULTI_VARIANT } from '../tools/responsive-images-config.mjs';

const ROOT = process.cwd();

/**
 * @param {string} dirRel
 */
async function listAbs(dirRel) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => ({ abs: path.join(dirAbs, e.name), name: e.name }));
}

async function main() {
  let deleted = 0;
  const dirs = TARGETS.map((t) => t.dir);

  for (const dir of dirs) {
    const files = await listAbs(dir);
    const targets = files.filter((f) => RE_MULTI_VARIANT.test(f.name));
    for (const f of targets) {
      await fs.unlink(f.abs);
      deleted += 1;
    }
    if (targets.length) {
      console.log(`[${dir}] supprimés: ${targets.length}`);
    }
  }
  console.log(`cleanup: OK (supprimés: ${deleted})`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
