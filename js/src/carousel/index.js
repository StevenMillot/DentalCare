/**
 * Point d’entrée du carrousel média cabinet.
 *
 * Build : `npm run js:bundle` (esbuild IIFE) → `js/cabinet-media-carousel.js`
 * Prod : `js/cabinet-media-carousel.min.js` via `npm run dev:refresh`
 *
 * HTML requis : `#cabinet-media-carousel` avec structure `.cabinet-media-carousel__*`.
 * Option : `data-autoplay-interval="5200"` (ms, min. 2000).
 *
 * API exposée : `window.initCabinetMediaCarousel(root)` — retourne `{ destroy }` ou `null`.
 */
import { initCabinetMediaCarousel } from './init.js';
import { onDomReady } from '../script/dom.js';

window.initCabinetMediaCarousel = initCabinetMediaCarousel;

onDomReady(() => {
  const el = document.getElementById('cabinet-media-carousel');
  if (el) initCabinetMediaCarousel(el);
});
