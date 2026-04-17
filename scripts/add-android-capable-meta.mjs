import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.html'))
  .map((e) => path.join(root, e.name));

const tag = '    <meta name="mobile-web-app-capable" content="yes">';
const testRe = /name="mobile-web-app-capable"/i;
const insertAfter = /<meta\s+name="theme-color"[^>]*>\s*/i;

let changed = 0;
for (const file of htmlFiles) {
  const before = fs.readFileSync(file, 'utf8');
  if (testRe.test(before)) continue;
  let after = before;
  const m = after.match(insertAfter);
  if (m && m.index != null) {
    const idx = m.index + m[0].length;
    after = after.slice(0, idx) + tag + '\n' + after.slice(idx);
  } else {
    after = after.replace(/<\/head>/i, `${tag}\n</head>`);
  }
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed += 1;
  }
}

console.log(`Added mobile-web-app-capable to ${changed}/${htmlFiles.length} HTML files.`);

