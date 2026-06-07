/**
 * Helpers DOM partagés (carrousel + scripts futurs).
 * Importé par `js/src/carousel/index.js` ; bundlé dans `cabinet-media-carousel.js`.
 */
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function defer(fn) {
  if (window.requestIdleCallback) {
    requestIdleCallback(fn, { timeout: 100 });
  } else {
    setTimeout(fn, 1);
  }
}

/** Exécute `fn` dès que le DOM est prêt (compatible script defer). */
export function onDomReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}
