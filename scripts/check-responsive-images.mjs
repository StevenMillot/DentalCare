/**
 * Vérifie que chaque original possède toutes les variantes attendues pour le srcset.
 *
 * Usage : npm run images:check
 * Inclus dans : npm run deploy:prepare
 *
 * Lecture seule. Exit 2 si variantes manquantes → npm run images:responsive
 * Fichiers corrompus (*-360w-720w.*) → npm run images:cleanup
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  TARGETS,
  RE_SINGLE_VARIANT,
  RE_MULTI_VARIANT,
  isOriginal,
  expectedVariantName,
} from '../tools/responsive-images-config.mjs';

const ROOT = process.cwd();

/**
 * @param {string} dirRel
 */
async function listDirFiles(dirRel) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => e.name);
}

async function main() {
  let ok = true;

  for (const target of TARGETS) {
    const names = await listDirFiles(target.dir);
    const files = names.filter((n) => !n.startsWith('.'));

    const originals = files.filter((n) => isOriginal(n, target.exts));
    const variants = new Set(files.filter((n) => RE_SINGLE_VARIANT.test(n)));
    const weird = files.filter((n) => RE_MULTI_VARIANT.test(n));

    const missing = [];
    for (const base of originals) {
      const ext = path.extname(base).toLowerCase();
      for (const w of target.widths) {
        const expected = expectedVariantName(base, w, ext);
        if (!variants.has(expected)) missing.push(path.posix.join(target.dir, expected));
      }
    }

    if (missing.length) {
      ok = false;
      console.log(`\n[${target.dir}] Variantes manquantes (${missing.length})`);
      missing.slice(0, 40).forEach((p) => console.log(`- ${p}`));
      if (missing.length > 40) console.log(`- ... +${missing.length - 40}`);
      console.log('→ Corriger: npm run images:responsive');
    }

    if (weird.length) {
      console.log(`\n[${target.dir}] Fichiers suspects (variants de variants) (${weird.length})`);
      weird.slice(0, 40).forEach((n) => console.log(`- ${path.posix.join(target.dir, n)}`));
      if (weird.length > 40) console.log(`- ... +${weird.length - 40}`);
      console.log('→ Nettoyer: npm run images:cleanup');
    }
  }

  if (!ok) process.exit(2);
  console.log('\nOK: variantes responsive présentes.');
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
