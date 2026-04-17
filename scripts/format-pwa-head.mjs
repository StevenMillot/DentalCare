import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.html'))
  .map((e) => path.join(root, e.name));

function normalizePwaHeadFormatting(html) {
  // Ensure each PWA-related tag starts on its own line with indentation.
  const tags = [
    'meta name="mobile-web-app-capable"',
    'meta name="apple-mobile-web-app-capable"',
    'meta name="apple-mobile-web-app-title"',
    'meta name="apple-mobile-web-app-status-bar-style"',
    'link rel="manifest"',
    'link rel="apple-touch-icon"',
  ];

  let out = html;

  for (const t of tags) {
    // Insert newline before the tag if it is glued after a closing '>'.
    const re = new RegExp(`>(\\s*)<(${t})`, 'gi');
    out = out.replace(re, `>\n    <${t}`);
  }

  // Also fix cases where tags are concatenated without the leading '<' change above.
  out = out.replace(/<\/meta>\s*/gi, '');
  // Collapse excessive blank lines in head
  out = out.replace(/\n{3,}/g, '\n\n');

  return out;
}

let changed = 0;
for (const file of htmlFiles) {
  const before = fs.readFileSync(file, 'utf8');
  const after = normalizePwaHeadFormatting(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed += 1;
  }
}

console.log(`Formatted PWA head tags in ${changed}/${htmlFiles.length} HTML files.`);

