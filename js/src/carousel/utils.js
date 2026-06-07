/**
 * Utilitaires DOM du carrousel : media queries, clones de slides, boutons nav, focus trap.
 */
import { CONFIG } from './constants.js';

export function bindMediaQuery(mq, fn) {
  if (mq.addEventListener) mq.addEventListener('change', fn);
  else if (mq.addListener) mq.addListener(fn);
}

export function unbindMediaQuery(mq, fn) {
  if (mq.removeEventListener) mq.removeEventListener('change', fn);
  else if (mq.removeListener) mq.removeListener(fn);
}

export function normalizeIndex(index, count) {
  return ((index % count) + count) % count;
}

export function navArrowSvg(direction) {
  return (
    `<svg class="icon icon--primary" viewBox="0 0 24 24" aria-hidden="true">` +
    `<path d="${CONFIG.NAV_ARROW_PATHS[direction]}"/></svg>`
  );
}

export function createNavButton(direction, classPrefix) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${classPrefix}__nav ${classPrefix}__nav--${direction}`;
  btn.setAttribute(
    'aria-label',
    direction === 'prev' ? 'Média précédent' : 'Média suivant'
  );
  btn.innerHTML = navArrowSvg(direction);
  return btn;
}

export function cloneSlide(el, isClone) {
  const clone = el.cloneNode(true);
  clone.setAttribute('data-cabinet-clone', isClone ? 'true' : 'false');
  clone.setAttribute('aria-hidden', 'true');
  clone.removeAttribute('id');
  const openBtn = clone.querySelector('.cabinet-media-carousel__open');
  if (openBtn) openBtn.setAttribute('tabindex', '-1');
  return clone;
}

export function getFocusable(container) {
  return [...container.querySelectorAll(
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((el) => {
    const st = window.getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none') return false;
    if (st.position === 'fixed') return true;
    return el.offsetParent !== null || el === document.activeElement;
  });
}
