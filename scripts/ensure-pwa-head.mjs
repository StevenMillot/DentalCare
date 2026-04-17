import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.html'))
  .map((e) => path.join(root, e.name));

function ensureOnce(html, snippet, testRe, insertAfterRe = null) {
  if (testRe.test(html)) return html;
  if (insertAfterRe) {
    const m = html.match(insertAfterRe);
    if (m && m.index != null) {
      const idx = m.index + m[0].length;
      return html.slice(0, idx) + '\n' + snippet + html.slice(idx);
    }
  }
  return html.replace(/<\/head>/i, `${snippet}\n</head>`);
}

const manifestLink = '    <link rel="manifest" href="site.webmanifest">';
const appleTouch = '    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">';
const iosCapable = '    <meta name="apple-mobile-web-app-capable" content="yes">';
const iosTitle = '    <meta name="apple-mobile-web-app-title" content="Parodontia">';
const iosStatus = '    <meta name="apple-mobile-web-app-status-bar-style" content="default">';
const androidCapable = '    <meta name="mobile-web-app-capable" content="yes">';

let changed = 0;

for (const file of htmlFiles) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  // Keep these in head; insert after theme-color if present.
  const afterThemeColor = /<meta\s+name="theme-color"[^>]*>\s*/i;

  after = ensureOnce(after, manifestLink, /rel="manifest"/i, afterThemeColor);
  after = ensureOnce(after, appleTouch, /rel="apple-touch-icon"/i, afterThemeColor);

  after = ensureOnce(after, iosCapable, /apple-mobile-web-app-capable/i, afterThemeColor);
  after = ensureOnce(after, iosTitle, /apple-mobile-web-app-title/i, afterThemeColor);
  after = ensureOnce(after, iosStatus, /apple-mobile-web-app-status-bar-style/i, afterThemeColor);
  after = ensureOnce(after, androidCapable, /mobile-web-app-capable/i, afterThemeColor);

  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed += 1;
  }
}

console.log(`Ensured PWA head tags in ${changed}/${htmlFiles.length} HTML files.`);

