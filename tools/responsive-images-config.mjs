/**
 * Configuration partagée des variantes responsive (srcset).
 *
 * Consommée par :
 * - `tools/generate-responsive-images.mjs` — génère les fichiers manquants
 * - `scripts/check-responsive-images.mjs` — vérifie la présence des variantes
 * - `scripts/cleanup-responsive-images.mjs` — supprime les doublons corrompus
 *
 * Convention de nommage :
 * - Original : `nom-fichier.jpg` ou `nom-fichier.avif`
 * - Variante : `nom-fichier-360w.jpg` (une seule largeur avant l’extension)
 */

import path from 'node:path';

/** @typedef {{ dir: string, exts: string[], widths: number[], format: 'jpeg'|'avif', quality: number }} ResponsiveTarget */

/** @type {ResponsiveTarget[]} */
export const TARGETS = [
  {
    dir: 'assets/team',
    exts: ['.jpg', '.jpeg'],
    widths: [360, 540, 720, 1080],
    format: 'jpeg',
    quality: 78,
  },
  {
    dir: 'assets/cabinet-gallery',
    exts: ['.avif'],
    widths: [240, 480, 640, 960, 1600],
    format: 'avif',
    quality: 50,
  },
];

/** Variante simple : `photo-720w.jpg` */
export const RE_SINGLE_VARIANT = /-\d+w\.(?:avif|jpe?g)$/i;

/** Doublon corrompu : `photo-1080w-360w.jpg` (ne jamais utiliser comme source) */
export const RE_MULTI_VARIANT = /-\d+w-.*-\d+w\.(?:avif|jpe?g)$/i;

/**
 * @param {string} filename
 */
export function isResponsiveVariant(filename) {
  return RE_SINGLE_VARIANT.test(filename);
}

/**
 * @param {string} filename
 */
export function isMultiVariant(filename) {
  return RE_MULTI_VARIANT.test(filename);
}

/**
 * Fichier source (original), pas une variante déjà générée.
 * @param {string} filename
 * @param {string[]} allowedExts
 */
export function isOriginal(filename, allowedExts) {
  const ext = path.extname(filename).toLowerCase();
  if (!allowedExts.includes(ext)) return false;
  if (isResponsiveVariant(filename)) return false;
  if (isMultiVariant(filename)) return false;
  return true;
}

/**
 * @param {string} baseName — ex. `dr-smith.jpg`
 * @param {number} w
 * @param {string} ext — ex. `.jpg`
 */
export function expectedVariantName(baseName, w, ext) {
  return `${baseName.slice(0, -path.extname(baseName).length)}-${w}w${ext}`;
}

/**
 * @param {string} baseName
 * @param {number[]} widths
 * @param {string} ext
 * @param {Set<string>} existingNames — noms de fichiers dans le dossier
 */
export function missingWidthsFor(baseName, widths, ext, existingNames) {
  return widths.filter((w) => !existingNames.has(expectedVariantName(baseName, w, ext)));
}
