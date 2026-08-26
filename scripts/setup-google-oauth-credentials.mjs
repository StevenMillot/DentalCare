#!/usr/bin/env node
// Génère le fichier de credentials ADC (Application Default Credentials) au format
// "authorized_user" attendu par google-auth-library, à partir des 3 valeurs obtenues
// via Google OAuth Playground (voir GUIDE-MCP-SEARCH-CONSOLE-GA4.md, section "Option mobile").
//
// Usage :
//   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... GOOGLE_OAUTH_REFRESH_TOKEN=... \
//     node scripts/setup-google-oauth-credentials.mjs
//
// Ces 3 variables peuvent aussi être définies comme secrets Cursor (Cloud Agents > Secrets)
// pour être ré-injectées automatiquement dans les futures sessions.

import { mkdirSync, writeFileSync, chmodSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const outPath = join(repoRoot, '.cursor', 'secrets', 'ga4-gsc-service-account.json');

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

const missing = [
  ['GOOGLE_OAUTH_CLIENT_ID', clientId],
  ['GOOGLE_OAUTH_CLIENT_SECRET', clientSecret],
  ['GOOGLE_OAUTH_REFRESH_TOKEN', refreshToken],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(
    `Variables manquantes : ${missing.join(', ')}\n` +
      'Voir GUIDE-MCP-SEARCH-CONSOLE-GA4.md pour les obtenir via OAuth Playground.'
  );
  process.exit(1);
}

const credentials = {
  type: 'authorized_user',
  client_id: clientId,
  client_secret: clientSecret,
  refresh_token: refreshToken,
};

if (!existsSync(dirname(outPath))) {
  mkdirSync(dirname(outPath), { recursive: true });
}

writeFileSync(outPath, JSON.stringify(credentials, null, 2) + '\n', { mode: 0o600 });
chmodSync(outPath, 0o600);

console.log(`Fichier de credentials écrit : ${outPath}`);
console.log('Rappel : ce fichier ne doit jamais être commit (déjà exclu par .gitignore).');
