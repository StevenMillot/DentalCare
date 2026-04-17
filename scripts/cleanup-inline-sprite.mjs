import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function listHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!e.name.endsWith('.html')) continue;
    out.push(path.join(dir, e.name));
  }
  return out;
}

const htmlFiles = listHtmlFiles(root);

const reInlineSpriteSvg = /<svg\b[^>]*class="svg-sprite"[^>]*>[\s\S]*?<\/svg>\s*/g;
const reInlineSymbol = /<symbol\b[^>]*\bid="i-[^"]+"[^>]*>[\s\S]*?<\/symbol>\s*/g;

let changedCount = 0;

for (const file of htmlFiles) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  after = after.replace(reInlineSpriteSvg, '');
  after = after.replace(reInlineSymbol, '');

  // Compress accidental double blank lines left by removals (keep formatting readable)
  after = after.replace(/\n{4,}/g, '\n\n\n');

  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changedCount += 1;
  }
}

console.log(`Cleaned inline sprite/symbols in ${changedCount}/${htmlFiles.length} HTML files.`);

