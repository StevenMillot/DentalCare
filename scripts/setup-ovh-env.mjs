#!/usr/bin/env node
// Génère le fichier .env.ovh (identifiants FTP/SFTP OVH) attendu par
// deploy-ovh.sh, à partir de variables d'environnement — typiquement des
// secrets Cursor (Cloud Agents > Secrets), pour permettre un déploiement
// depuis un Cloud Agent sans jamais committer d'identifiant.
//
// Usage :
//   FTP_HOST=... FTP_USER=... FTP_PASS=... node scripts/setup-ovh-env.mjs
//
// Variables obligatoires : FTP_HOST, FTP_USER, FTP_PASS
// Variables optionnelles (valeurs par défaut ci-dessous, cf. .env.ovh.template) :
//   FTP_PORT (21), FTP_REMOTE_DIR (/www), USE_SFTP (false), SFTP_PORT (22),
//   CREATE_BACKUP (true), DELETE_REMOTE (true), SITE_URL (https://paro-spe.fr),
//   ADMIN_EMAIL, DISCORD_WEBHOOK_URL, MONITORING_API_KEY

import { writeFileSync, chmodSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const outPath = join(repoRoot, '.env.ovh');

const required = {
  FTP_HOST: process.env.FTP_HOST,
  FTP_USER: process.env.FTP_USER,
  FTP_PASS: process.env.FTP_PASS,
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(
    `Variables manquantes : ${missing.join(', ')}\n` +
      'Voir DEPLOYMENT.md / .env.ovh.template pour les obtenir (espace client OVH > Hébergements > FTP-SSH).'
  );
  process.exit(1);
}

const optional = {
  FTP_PORT: process.env.FTP_PORT || '21',
  FTP_REMOTE_DIR: process.env.FTP_REMOTE_DIR || '/www',
  USE_SFTP: process.env.USE_SFTP || 'false',
  SFTP_PORT: process.env.SFTP_PORT || '22',
  CREATE_BACKUP: process.env.CREATE_BACKUP || 'true',
  DELETE_REMOTE: process.env.DELETE_REMOTE || 'true',
  SITE_URL: process.env.SITE_URL || 'https://paro-spe.fr',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',
  MONITORING_API_KEY: process.env.MONITORING_API_KEY || '',
};

const lines = [
  '# Généré automatiquement par scripts/setup-ovh-env.mjs à partir des secrets',
  "# Cursor (Cloud Agents > Secrets). Ne jamais committer ce fichier (voir .gitignore).",
  '',
  `FTP_HOST=${required.FTP_HOST}`,
  `FTP_USER=${required.FTP_USER}`,
  `FTP_PASS=${required.FTP_PASS}`,
  `FTP_PORT=${optional.FTP_PORT}`,
  `FTP_REMOTE_DIR=${optional.FTP_REMOTE_DIR}`,
  '',
  `USE_SFTP=${optional.USE_SFTP}`,
  `SFTP_PORT=${optional.SFTP_PORT}`,
  '',
  `CREATE_BACKUP=${optional.CREATE_BACKUP}`,
  `DELETE_REMOTE=${optional.DELETE_REMOTE}`,
  '',
  `SITE_URL=${optional.SITE_URL}`,
  `ADMIN_EMAIL=${optional.ADMIN_EMAIL}`,
  '',
  `DISCORD_WEBHOOK_URL=${optional.DISCORD_WEBHOOK_URL}`,
  `MONITORING_API_KEY=${optional.MONITORING_API_KEY}`,
  '',
];

writeFileSync(outPath, lines.join('\n'), { mode: 0o600 });
chmodSync(outPath, 0o600);

console.log(`Fichier de configuration OVH écrit : ${outPath}`);
console.log("Rappel : ce fichier ne doit jamais être commit (déjà exclu par .gitignore).");
