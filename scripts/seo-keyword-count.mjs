#!/usr/bin/env node
/**
 * Comptage de représentation des mots-clés sur les pages HTML publiques.
 * Sert de base au livrable docs/analyse-seo-mots-cles-paro-spe*.html.
 *
 * Usage : node scripts/seo-keyword-count.mjs [--json]
 */

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Pages techniques exclues du périmètre "public indexable".
const EXCLUDED = new Set(['404.html', '500.html', 'googlef6c8553cf584ed62.html']);

/**
 * Chaque terme est décrit par une expression régulière tolérante aux
 * variantes d'apostrophes, de traits d'union et d'accents optionnels.
 */
const TERMS = [
  ['Parodontie', /parodontie/gi, 'Parodontie'],
  ['Parodontologie', /parodontologie/gi, 'Parodontie'],
  ['Parodontiste', /parodontistes?/gi, 'Parodontie'],
  ['Parodontologue', /parodontologues?/gi, 'Parodontie'],
  ['Parodontite', /parodontites?/gi, 'Parodontie'],
  ['Surfaçage', /surfa[çc]age/gi, 'Parodontie'],
  ['Greffe gingivale', /greffes?\s+gingivale?s?/gi, 'Parodontie'],
  ['Chirurgie muco-gingivale', /chirurgie\s+muco[- ]gingivale/gi, 'Parodontie'],
  ['Chirurgie des gencives', /chirurgie\s+des\s+gencives/gi, 'Parodontie'],
  ['Maintenance parodontale', /maintenance\s+parodontale/gi, 'Parodontie'],

  ['Implant / implants', /implant(s)?\b/gi, 'Implantologie'],
  ['Implant dentaire (singulier)', /implant\s+dentaire\b/gi, 'Implantologie'],
  ['Implants dentaires (pluriel)', /implants\s+dentaires/gi, 'Implantologie'],
  ['Implantologie', /implantologie/gi, 'Implantologie'],
  ['Implantologue', /implantologues?/gi, 'Implantologie'],
  ['Greffe osseuse', /greffes?\s+osseuses?/gi, 'Implantologie'],
  ['Greffe sinusienne / Sinus lift', /greffes?\s+sinusiennes?|sinus\s+lift|[ée]l[ée]vations?\s+sinusiennes?/gi, 'Implantologie'],
  ['Chirurgie implantaire', /chirurgie\s+implantaire/gi, 'Implantologie'],
  ['Chirurgie pré-implantaire', /chirurgie\s+pr[ée][- ]implantaire/gi, 'Implantologie'],

  ['Chirurgie orale', /chirurgie\s+orale/gi, 'Chirurgie orale & imagerie'],
  ['Chirurgie buccale', /chirurgie\s+buccale/gi, 'Chirurgie orale & imagerie'],
  ['Extraction dentaire', /extractions?\s+dentaires?/gi, 'Chirurgie orale & imagerie'],
  ['Extraction dents de sagesse', /(extractions?|avulsions?)\s+(de\s+|des\s+)?dents?\s+de\s+sagesse/gi, 'Chirurgie orale & imagerie'],
  ['Avulsion', /avulsions?/gi, 'Chirurgie orale & imagerie'],
  ['Frénectomie', /fr[ée]nectomies?/gi, 'Chirurgie orale & imagerie'],
  ['Freinectomie (faute)', /freinectomies?/gi, 'Chirurgie orale & imagerie'],
  ['Désinclusion', /d[ée]sinclusions?/gi, 'Chirurgie orale & imagerie'],
  ['Dégagement de dent incluse', /d[ée]gagements?\s+(de\s+)?dents?\s+incluses?/gi, 'Chirurgie orale & imagerie'],
  ['CBCT', /CBCT/g, 'Chirurgie orale & imagerie'],
  ['Cône beam / Cone beam', /c[ôo]ne\s*beam/gi, 'Chirurgie orale & imagerie'],

  ['Déchaussement dentaire', /d[ée]chaussements?/gi, 'Hors liste — patient / local'],
  ['Gencives qui saignent', /gencives?\s+qui\s+saignent|saignements?\s+(des\s+|de\s+la\s+)?gencives?/gi, 'Hors liste — patient / local'],
  ['Dents qui bougent / mobilité', /dents?\s+qui\s+bougent|mobilit[ée]s?\s+dentaires?/gi, 'Hors liste — patient / local'],
  ['Récession gingivale', /r[ée]cessions?\s+(gingivales?|parodontales?)|r[ée]cessions?\s+de\s+gencives?/gi, 'Hors liste — patient / local'],
  ['Maladie des gencives', /maladies?\s+des\s+gencives/gi, 'Hors liste — patient / local'],
  ['Greffe de gencive', /greffes?\s+de\s+gencives?/gi, 'Hors liste — patient / local'],
  ['Prix / tarif / coût', /\b(prix|tarifs?|co[ûu]ts?|honoraires|devis)\b/gi, 'Hors liste — patient / local'],
  ['Parodontiste Châtenay-Malabry / 92', /parodontistes?[^.<]{0,60}(Ch[âa]tenay|\(92\))/gi, 'Hors liste — patient / local'],
  ['Implant dentaire (sing.) Châtenay-Malabry / 92', /implant\s+dentaire[^.<]{0,50}(Ch[âa]tenay|\(92\))/gi, 'Hors liste — patient / local'],
];

const files = (await readdir(ROOT))
  .filter((f) => f.endsWith('.html') && !EXCLUDED.has(f))
  .sort();

const contents = new Map();
for (const file of files) {
  contents.set(file, await readFile(path.join(ROOT, file), 'utf8'));
}

const rows = TERMS.map(([label, re, group]) => {
  let occ = 0;
  const hits = [];
  for (const [file, html] of contents) {
    const matches = html.match(new RegExp(re.source, re.flags));
    if (matches?.length) {
      occ += matches.length;
      hits.push([file, matches.length]);
    }
  }
  return { group, label, occ, files: hits.length, hits };
});

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ pages: files.length, rows }, null, 2));
} else {
  console.log(`Pages analysées : ${files.length}\n`);
  let currentGroup = null;
  for (const row of rows) {
    if (row.group !== currentGroup) {
      currentGroup = row.group;
      console.log(`\n=== ${currentGroup} ===`);
    }
    console.log(
      `${row.label.padEnd(42)} occ=${String(row.occ).padStart(4)}  fichiers=${String(row.files).padStart(2)}  ${row.hits.map(([f, n]) => `${f}:${n}`).join(', ')}`
    );
  }
}
