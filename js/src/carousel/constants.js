/**
 * Constantes du carrousel média cabinet.
 * Modifier ici les seuils swipe, durées autoplay / lightbox, chemins SVG des flèches.
 */
export const CONFIG = {
  MOBILE_MQ: '(max-width: 767px)',
  SWIPE_THRESHOLD_PX: 48,
  SWIPE_RATIO: 1.2,
  DEFAULT_AUTOPLAY_MS: 5200,
  INTERACTION_RESUME_MS: 4000,
  THUMB_INTERACTION_RESUME_MS: 5000,
  LIGHTBOX_FADE_MS: 180,
  SLIDE_GAP_PX: 20,
  PEEK_EACH_SIDE: 0.2,
  NAV_ARROW_PATHS: {
    prev: 'M14 6 8 12l6 6 1.4-1.4L10.8 12l4.6-4.6z',
    next: 'M10 6 16 12l-6 6-1.4-1.4L13.2 12l-4.6-4.6z',
  },
  PLAY_ICON_PATH: 'M8 5v14l11-7z',
};
