import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

const TARGETS = [
  {
    dir: 'assets/team',
    exts: new Set(['.jpg', '.jpeg']),
    widths: [360, 540, 720, 1080],
  },
  {
    dir: 'assets/cabinet-gallery',
    exts: new Set(['.avif']),
    widths: [240, 480, 640, 960, 1600],
  },
];

const reAnyVariant = /-\d+w\.(?:avif|jpe?g)$/i;
const reMultiVariant = /-\d+w-.*-\d+w\.(?:avif|jpe?g)$/i;

async function listDirFiles(dirRel) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => e.name);
}

function noExt(name) {
  return name.slice(0, -path.extname(name).length);
}

function expectedVariantName(baseName, w, ext) {
  return `${noExt(baseName)}-${w}w${ext}`;
}

async function main() {
  let ok = true;

  for (const t of TARGETS) {
    const names = await listDirFiles(t.dir);
    const files = names
      .filter((n) => !n.startsWith('.'))
      .filter((n) => t.exts.has(path.extname(n).toLowerCase()));

    const originals = files.filter((n) => !reAnyVariant.test(n));
    const variants = new Set(files.filter((n) => reAnyVariant.test(n)));
    const weird = files.filter((n) => reMultiVariant.test(n));

    const missing = [];
    for (const base of originals) {
      const ext = path.extname(base).toLowerCase();
      for (const w of t.widths) {
        const expected = expectedVariantName(base, w, ext);
        if (!variants.has(expected)) missing.push(path.posix.join(t.dir, expected));
      }
    }

    if (missing.length) {
      ok = false;
      console.log(`\n[${t.dir}] Variantes manquantes (${missing.length})`);
      missing.slice(0, 40).forEach((p) => console.log(`- ${p}`));
      if (missing.length > 40) console.log(`- ... +${missing.length - 40}`);
      console.log(`→ Corriger: npm run images:responsive`);
    }

    if (weird.length) {
      console.log(`\n[${t.dir}] Fichiers suspects (variants de variants) (${weird.length})`);
      weird.slice(0, 40).forEach((n) => console.log(`- ${path.posix.join(t.dir, n)}`));
      if (weird.length > 40) console.log(`- ... +${weird.length - 40}`);
      console.log(`→ Nettoyer: npm run images:cleanup`);
    }
  }

  if (!ok) process.exit(2);
  console.log('\nOK: variantes responsive présentes.');
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});

