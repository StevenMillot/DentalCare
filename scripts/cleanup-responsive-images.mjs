import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIRS = ['assets/team', 'assets/cabinet-gallery'];

const reMultiVariant = /-\d+w-.*-\d+w\.(?:avif|jpe?g)$/i;

async function listAbs(dirRel) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => ({ abs: path.join(dirAbs, e.name), name: e.name }));
}

async function main() {
  let deleted = 0;
  for (const dir of DIRS) {
    const files = await listAbs(dir);
    const targets = files.filter((f) => reMultiVariant.test(f.name));
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

