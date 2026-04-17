import fs from 'node:fs/promises';

const SW_PATH = new URL('../sw.js', import.meta.url);

async function main() {
  const raw = await fs.readFile(SW_PATH, 'utf8');

  const re = /const\s+CACHE_VERSION\s*=\s*'dc-v(\d+)';/;
  const m = raw.match(re);
  if (!m) throw new Error('CACHE_VERSION introuvable dans sw.js');

  const current = Number(m[1]);
  if (!Number.isFinite(current)) throw new Error('CACHE_VERSION invalide dans sw.js');

  const nextVersion = current + 1;
  const next = raw.replace(re, `const CACHE_VERSION = 'dc-v${nextVersion}';`);

  if (next === raw) {
    console.log('sw:cache-version: déjà à jour');
    return;
  }

  await fs.writeFile(SW_PATH, next, 'utf8');
  console.log(`sw:cache-version: dc-v${current} -> dc-v${nextVersion}`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});

