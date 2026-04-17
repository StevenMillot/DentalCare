import fs from 'node:fs/promises';

const SPRITE_PATH = new URL('../assets/Icones/icons.svg', import.meta.url);
const SCRIPT_PATH = new URL('../js/script.js', import.meta.url);

const START = 'const INLINE_SPRITE_SVG = `';
const END = '`;\n';

function escapeTemplateLiteral(text) {
  // On veut injecter le SVG tel quel dans un template literal JS.
  // Il faut échapper les backticks et les séquences ${...} potentielles.
  return text.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

async function main() {
  const [svgRaw, scriptRaw] = await Promise.all([
    fs.readFile(SPRITE_PATH, 'utf8'),
    fs.readFile(SCRIPT_PATH, 'utf8'),
  ]);

  const iStart = scriptRaw.indexOf(START);
  if (iStart < 0) {
    throw new Error('INLINE_SPRITE_SVG: début introuvable dans js/script.js');
  }
  const iAfterStart = iStart + START.length;
  const iEnd = scriptRaw.indexOf(END, iAfterStart);
  if (iEnd < 0) {
    throw new Error('INLINE_SPRITE_SVG: fin introuvable dans js/script.js');
  }

  const svg = svgRaw.trim();
  const injected = `${START}${escapeTemplateLiteral(svg)}${END}`;
  const next = scriptRaw.slice(0, iStart) + injected + scriptRaw.slice(iEnd + END.length);

  if (next === scriptRaw) {
    console.log('sync-inline-sprite: déjà à jour');
    return;
  }

  await fs.writeFile(SCRIPT_PATH, next, 'utf8');
  console.log('sync-inline-sprite: OK (INLINE_SPRITE_SVG mis à jour)');
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});

