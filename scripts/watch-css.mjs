/**
 * Recrée css/bundle.css à chaque modification d’une feuille source.
 *
 * Usage : npm run css:watch
 * (bundle.css et main.css sont ignorés)
 */

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_DIR = resolve(ROOT, 'css');
const IGNORED = new Set(['bundle.css', 'main.css']);

let timer = null;
let running = false;
let queued = false;

function rebuild() {
  if (running) {
    queued = true;
    return;
  }

  running = true;
  const child = spawn(
    'npm',
    ['run', '-s', 'css:bundle', '&&', 'npm', 'run', '-s', 'css:minify'],
    {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    }
  );

  child.on('exit', (code) => {
    running = false;
    if (code === 0) {
      const now = new Date().toLocaleTimeString('fr-FR');
      console.log(`[css:watch] bundle.css à jour — ${now}`);
    } else {
      console.error(`[css:watch] échec (code ${code})`);
    }
    if (queued) {
      queued = false;
      rebuild();
    }
  });
}

rebuild();

watch(CSS_DIR, (_event, filename) => {
  if (!filename || !filename.endsWith('.css') || IGNORED.has(filename)) return;
  clearTimeout(timer);
  timer = setTimeout(rebuild, 80);
});

console.log('[css:watch] écoute css/*.css — Ctrl+C pour arrêter');
