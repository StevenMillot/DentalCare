/**
 * Carrousel média cabinet — images + vidéos, boucle fluide, lightbox, a11y.
 * Sans dépendance. init() / destroy() pour cycle de vie propre.
 */
(function () {
  'use strict';

  var MOBILE_MQ = '(max-width: 767px)';
  var SWIPE_THRESHOLD_PX = 48;
  var SWIPE_RATIO = 1.2;
  var DEFAULT_AUTOPLAY_MS = 5200;
  /** Espace entre diapositives (px) */
  var SLIDE_GAP_PX = 20;
  /** Part visible des slides latérales (0.2 = 20 %) */
  var PEEK_EACH_SIDE = 0.2;

  function addMediaListener(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  function removeMediaListener(mq, fn) {
    if (mq.removeEventListener) mq.removeEventListener('change', fn);
    else if (mq.removeListener) mq.removeListener(fn);
  }

  /**
   * @param {HTMLElement} root
   * @returns {{ destroy: function }|null}
   */
  function initCabinetMediaCarousel(root) {
    if (!root) return null;

    var viewport = root.querySelector('.cabinet-media-carousel__viewport');
    var track = root.querySelector('.cabinet-media-carousel__track');
    var thumbsContainer = root.querySelector('.cabinet-media-carousel__thumbs');

    if (!viewport || !track || !thumbsContainer) return null;

    var originals = Array.prototype.slice.call(
      track.querySelectorAll('[data-cabinet-slide]')
    );
    if (originals.length === 0) return null;

    var n = originals.length;
    var positionIndex = n >= 2 ? 1 : 0;
    var isInstant = false;
    var autoplayTimer = null;
    var reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var reducedMotion = reducedMotionMq.matches;
    var mqMobile = window.matchMedia(MOBILE_MQ);
    var isMobile = mqMobile.matches;

    var autoplayInterval = parseInt(root.getAttribute('data-autoplay-interval'), 10);
    if (isNaN(autoplayInterval) || autoplayInterval < 2000) {
      autoplayInterval = DEFAULT_AUTOPLAY_MS;
    }

    /** Pause autoplay uniquement au survol de la diapositive centrale */
    var hoverPause = false;
    /** true après un swipe horizontal : bloque le clic « fantôme » sur le bouton lightbox */
    var suppressOpenClick = false;

    var slideWidthPx = 0;
    var gapPx = SLIDE_GAP_PX;
    var offsetPx = 0;
    var lastFocusEl = null;

    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var dragging = false;
    var resizeRaf = null;

    var bound = {
      resize: null,
      mq: null,
      reduced: null,
      transitionEnd: null,
      keydownViewport: null,
      pointerDown: null,
      pointerMove: null,
      pointerUp: null,
      pointerCancel: null,
      openMouseEnter: null,
      openMouseLeave: null,
      lightboxKey: null,
      lightboxBackdrop: null,
      lightboxClose: null,
      focusTrap: null
    };

    var lightboxEl = null;
    var lightboxMediaHost = null;
    var lightboxVideoEl = null;
    var scrollLockY = 0;

    /* ---------- Construction piste (boucle) ---------- */
    track.textContent = '';
    if (n >= 2) {
      track.appendChild(cloneSlide(originals[n - 1], true));
      originals.forEach(function (fig) {
        track.appendChild(fig);
      });
      track.appendChild(cloneSlide(originals[0], true));
    } else {
      track.appendChild(originals[0]);
    }

    var slidesOnTrack = Array.prototype.slice.call(
      track.querySelectorAll('[data-cabinet-slide]')
    );

    function cloneSlide(el, isClone) {
      var c = el.cloneNode(true);
      c.setAttribute('data-cabinet-clone', isClone ? 'true' : 'false');
      c.setAttribute('aria-hidden', 'true');
      c.removeAttribute('id');
      var o = c.querySelector('.cabinet-media-carousel__open');
      if (o) o.setAttribute('tabindex', '-1');
      return c;
    }

    /* ---------- Miniatures ---------- */
    thumbsContainer.textContent = '';
    originals.forEach(function (fig, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cabinet-media-carousel__thumb';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('aria-label', fig.getAttribute('data-label') || 'Média ' + (i + 1));
      btn.setAttribute('id', root.id + '-tab-' + i);
      btn.setAttribute('aria-controls', fig.id || root.id + '-slide-' + i);

      var thumbSrc =
        fig.getAttribute('data-thumb') ||
        (fig.querySelector('img') && fig.querySelector('img').getAttribute('src')) ||
        (fig.querySelector('video') && fig.querySelector('video').getAttribute('poster')) ||
        '';
      var im = document.createElement('img');
      im.src = thumbSrc;
      im.alt = '';
      im.decoding = 'async';
      im.loading = 'lazy';
      btn.appendChild(im);

      if (fig.querySelector('video')) {
        btn.classList.add('cabinet-media-carousel__thumb--video');
        var playBadge = document.createElement('span');
        playBadge.className =
          'cabinet-media-carousel__badge-video cabinet-media-carousel__badge-video--thumb';
        playBadge.setAttribute('aria-hidden', 'true');
        playBadge.innerHTML = '<i class="fas fa-play"></i>';
        btn.appendChild(playBadge);
      }

      btn.addEventListener('click', function () {
        goToRealIndex(i);
      });
      thumbsContainer.appendChild(btn);
    });

    var thumbButtons = Array.prototype.slice.call(
      thumbsContainer.querySelectorAll('.cabinet-media-carousel__thumb')
    );

    /* ---------- Métriques & transform ---------- */
    function layoutMetrics() {
      var w = viewport.clientWidth;
      if (w <= 0) return;
      gapPx = SLIDE_GAP_PX;
      /* W = 0.2*S + S + 0.2*S => S = W / 1.4 */
      slideWidthPx = w / (1 + 2 * PEEK_EACH_SIDE);
      offsetPx = w / 2 - slideWidthPx / 2;
      var count = slidesOnTrack.length;
      var trackW = count * slideWidthPx + Math.max(0, count - 1) * gapPx;
      track.style.width = trackW + 'px';
      track.style.gap = gapPx + 'px';
      slidesOnTrack.forEach(function (sl) {
        sl.style.width = slideWidthPx + 'px';
        sl.style.flexBasis = slideWidthPx + 'px';
      });
    }

    function translateForPosition(p) {
      return offsetPx - p * (slideWidthPx + gapPx);
    }

    function applyTranslate() {
      var tx = translateForPosition(positionIndex);
      track.style.transform = 'translate3d(' + tx + 'px,0,0)';
    }

    function setInstant(on) {
      isInstant = on;
      if (on) root.classList.add('cabinet-media-carousel--instant');
      else root.classList.remove('cabinet-media-carousel--instant');
    }

    function updateLayoutMode() {
      isMobile = mqMobile.matches;
      root.classList.toggle('cabinet-media-carousel--mobile', isMobile);
      root.classList.toggle('cabinet-media-carousel--desktop', !isMobile);
      layoutMetrics();
      applyTranslate();
    }

    /* ---------- Index réel ---------- */
    function positionToRealIndex(p) {
      if (n < 2) return 0;
      if (p === 0) return n - 1;
      if (p === n + 1) return 0;
      return p - 1;
    }

    function currentRealIndex() {
      return positionToRealIndex(positionIndex);
    }

    function updateActiveStates(opts) {
      opts = opts || {};
      /* Par défaut défilement miniatures fluide ; false uniquement au premier rendu */
      var thumbSmooth = opts.thumbSmooth !== false;
      if (reducedMotion) thumbSmooth = false;
      var ri = currentRealIndex();
      slidesOnTrack.forEach(function (sl, idx) {
        var r = positionToRealIndex(idx);
        sl.classList.toggle('is-active', r === ri);
      });
      thumbButtons.forEach(function (tb, i) {
        tb.setAttribute('aria-selected', i === ri ? 'true' : 'false');
      });
      syncThumbScroll(ri, thumbSmooth);
      pauseAllVideosExcept(null);
    }

    function syncThumbScroll(ri, smooth) {
      var btn = thumbButtons[ri];
      var c = thumbsContainer;
      if (!btn || !c) return;

      /* Pas de défilement auto tant que l’utilisateur parcourt la liste (évite les sauts si l’autoplay avance). */
      if (typeof c.matches === 'function' && c.matches(':hover')) {
        return;
      }

      function scrollToActive() {
        var cRect = c.getBoundingClientRect();
        var bRect = btn.getBoundingClientRect();
        var delta = bRect.left + bRect.width / 2 - cRect.left - cRect.width / 2;
        var nextLeft = c.scrollLeft + delta;
        var maxS = Math.max(0, c.scrollWidth - c.clientWidth);
        nextLeft = Math.max(0, Math.min(nextLeft, maxS));
        if (smooth && typeof c.scrollTo === 'function') {
          try {
            c.scrollTo({ left: nextLeft, behavior: 'smooth' });
            return;
          } catch (e) {}
        }
        c.scrollLeft = nextLeft;
      }

      scrollToActive();
      if (smooth) {
        window.requestAnimationFrame(function () {
          scrollToActive();
        });
      }
    }

    /* ---------- Vidéos (carousel) ---------- */
    function getVideoEls() {
      return Array.prototype.slice.call(track.querySelectorAll('video'));
    }

    function pauseAllVideosExcept(videoToKeep) {
      getVideoEls().forEach(function (v) {
        if (v !== videoToKeep) {
          v.pause();
        }
      });
    }

    /* ---------- Autoplay ---------- */
    function clearAutoplayTimer() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function shouldRunAutoplay() {
      if (reducedMotion || n < 2) return false;
      if (hoverPause) return false;
      return true;
    }

    function refreshAutoplayState() {
      clearAutoplayTimer();
      if (!shouldRunAutoplay()) return;
      autoplayTimer = window.setInterval(function () {
        if (!shouldRunAutoplay()) return;
        moveNext();
      }, autoplayInterval);
    }

    /* ---------- Navigation ---------- */
    function moveNext() {
      if (n < 2) return;
      if (positionIndex < n + 1) {
        positionIndex += 1;
        setInstant(false);
        applyTranslate();
        updateActiveStates();
      }
    }

    function movePrev() {
      if (n < 2) return;
      if (positionIndex > 0) {
        positionIndex -= 1;
        setInstant(false);
        applyTranslate();
        updateActiveStates();
      }
    }

    function goToRealIndex(ri) {
      ri = ((ri % n) + n) % n;
      if (n < 2) {
        positionIndex = 0;
        setInstant(false);
        applyTranslate();
        updateActiveStates();
        return;
      }
      var target = ri + 1;
      setInstant(false);
      positionIndex = target;
      applyTranslate();
      updateActiveStates();
    }

    function onTransitionEnd(e) {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (n < 2) return;
      if (positionIndex === n + 1) {
        setInstant(true);
        positionIndex = 1;
        applyTranslate();
        updateActiveStates({ thumbSmooth: true });
        window.requestAnimationFrame(function () {
          setInstant(false);
        });
      } else if (positionIndex === 0) {
        setInstant(true);
        positionIndex = n;
        applyTranslate();
        updateActiveStates({ thumbSmooth: true });
        window.requestAnimationFrame(function () {
          setInstant(false);
        });
      }
    }

    /* ---------- Pointer / swipe ---------- */
    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      /* Ne pas capturer le pointeur si le clic vise le bouton lightbox : sinon le swipe
         mélange les coordonnées et peut bloquer l’ouverture de l’overlay. */
      if (e.target && e.target.closest && e.target.closest('.cabinet-media-carousel__open')) {
        suppressOpenClick = false;
        pointerId = null;
        dragging = false;
        return;
      }
      suppressOpenClick = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      dragging = true;
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    function onPointerMove(e) {
      if (!dragging || e.pointerId !== pointerId) return;
    }

    function onPointerUp(e) {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (err) {}
      pointerId = null;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      if (Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return;
      suppressOpenClick = true;
      if (dx < 0) moveNext();
      else movePrev();
    }

    /* ---------- Clavier ---------- */
    function onViewportKeydown(e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        movePrev();
      }
    }

    /* ---------- Lightbox ---------- */
    function ensureLightbox() {
      if (lightboxEl) return;
      lightboxEl = document.createElement('div');
      lightboxEl.className = 'cabinet-lightbox';
      lightboxEl.setAttribute('role', 'dialog');
      lightboxEl.setAttribute('aria-modal', 'true');
      lightboxEl.setAttribute('aria-label', 'Vue agrandie');
      lightboxEl.setAttribute('aria-hidden', 'true');
      lightboxEl.innerHTML =
        '<div class="cabinet-lightbox__backdrop" tabindex="-1" aria-hidden="true"></div>' +
        '<button type="button" class="cabinet-lightbox__close" aria-label="Fermer la vue agrandie">' +
        '<svg class="cabinet-lightbox__close-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path fill="none" d="M5.5 5.5l13 13m0-13l-13 13" />' +
        '</svg></button>' +
        '<div class="cabinet-lightbox__body" role="document"></div>';
      document.body.appendChild(lightboxEl);
      lightboxMediaHost = lightboxEl.querySelector('.cabinet-lightbox__body');
      var backdrop = lightboxEl.querySelector('.cabinet-lightbox__backdrop');
      var closeBtn = lightboxEl.querySelector('.cabinet-lightbox__close');

      backdrop.addEventListener('click', closeLightbox);
      closeBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        closeLightbox();
      });

      bound.lightboxKey = function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeLightbox();
        }
      };
      bound.focusTrap = function (e) {
        if (e.key !== 'Tab' || !lightboxEl.classList.contains('is-open')) return;
        var focusables = getFocusable(lightboxEl);
        if (focusables.length === 0) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
    }

    function getFocusable(container) {
      return Array.prototype.slice
        .call(
          container.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        )
        .filter(function (el) {
          var st = window.getComputedStyle(el);
          if (st.position === 'fixed') return true;
          return el.offsetParent !== null || el === document.activeElement;
        });
    }

    function lockScroll() {
      scrollLockY = window.scrollY || window.pageYOffset;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollLockY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    }

    function unlockScroll() {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollLockY);
    }

    function openLightboxFromSlide(fig) {
      ensureLightbox();
      lastFocusEl = document.activeElement;
      lightboxMediaHost.textContent = '';
      lightboxVideoEl = null;

      var img = fig.querySelector('.cabinet-media-carousel__media img');
      var vid = fig.querySelector('.cabinet-media-carousel__media video');

      if (vid) {
        var v = document.createElement('video');
        v.setAttribute('controls', '');
        v.muted = true;
        v.playsInline = true;
        if (vid.poster) v.poster = vid.poster;
        var sources = vid.querySelectorAll('source');
        if (sources.length) {
          sources.forEach(function (s) {
            var ns = document.createElement('source');
            ns.src = s.getAttribute('src') || '';
            if (s.getAttribute('type')) ns.type = s.getAttribute('type');
            v.appendChild(ns);
          });
        } else if (vid.src) {
          v.src = vid.src;
        } else if (vid.currentSrc) {
          v.src = vid.currentSrc;
        }
        lightboxMediaHost.appendChild(v);
        lightboxVideoEl = v;
        v.load();
        v.play().catch(function () {});
      } else if (img) {
        var ni = document.createElement('img');
        ni.src = img.currentSrc || img.src;
        ni.alt = img.alt || '';
        lightboxMediaHost.appendChild(ni);
      } else {
        return;
      }

      pauseAllVideosExcept(null);
      lightboxEl.classList.add('is-open');
      lightboxEl.setAttribute('aria-hidden', 'false');
      lockScroll();
      document.addEventListener('keydown', bound.lightboxKey);
      document.addEventListener('keydown', bound.focusTrap);
      var closeB = lightboxEl.querySelector('.cabinet-lightbox__close');
      window.requestAnimationFrame(function () {
        if (closeB) closeB.focus();
      });
    }

    function closeLightbox() {
      if (!lightboxEl || !lightboxEl.classList.contains('is-open')) return;
      lightboxEl.classList.remove('is-open');
      lightboxEl.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', bound.lightboxKey);
      document.removeEventListener('keydown', bound.focusTrap);
      unlockScroll();
      if (lightboxVideoEl) {
        lightboxVideoEl.pause();
        lightboxVideoEl.removeAttribute('src');
        lightboxVideoEl.load();
        lightboxVideoEl = null;
      }
      lightboxMediaHost.textContent = '';
      if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
        lastFocusEl.focus();
      }
      lastFocusEl = null;
    }

    /* ---------- Ouverture lightbox (originaux + clones → média source) ---------- */
    slidesOnTrack.forEach(function (fig) {
      var openBtn = fig.querySelector('.cabinet-media-carousel__open');
      if (!openBtn) return;
      openBtn.addEventListener('click', function (ev) {
        if (suppressOpenClick) {
          ev.preventDefault();
          ev.stopPropagation();
          suppressOpenClick = false;
          return;
        }
        var targetFig = fig;
        if (fig.getAttribute('data-cabinet-clone') === 'true') {
          var idx = slidesOnTrack.indexOf(fig);
          targetFig = originals[positionToRealIndex(idx)];
        }
        ev.preventDefault();
        ev.stopPropagation();
        openLightboxFromSlide(targetFig);
      });
    });

    /* ---------- prefers-reduced-motion ---------- */
    bound.reduced = function () {
      reducedMotion = reducedMotionMq.matches;
      refreshAutoplayState();
    };

    /* ---------- Resize ---------- */
    bound.resize = function () {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(function () {
        resizeRaf = null;
        layoutMetrics();
        applyTranslate();
      });
    };

    bound.mq = function () {
      updateLayoutMode();
    };

    bound.transitionEnd = onTransitionEnd;
    bound.keydownViewport = onViewportKeydown;
    bound.pointerDown = onPointerDown;
    bound.pointerMove = onPointerMove;
    bound.pointerUp = onPointerUp;
    bound.pointerCancel = onPointerUp;

    bound.openMouseEnter = function (e) {
      var sl = e.currentTarget.closest('.cabinet-media-carousel__slide');
      if (sl && sl.classList.contains('is-active')) {
        hoverPause = true;
        refreshAutoplayState();
      }
    };
    bound.openMouseLeave = function (e) {
      var sl = e.currentTarget.closest('.cabinet-media-carousel__slide');
      if (sl && sl.classList.contains('is-active')) {
        hoverPause = false;
        refreshAutoplayState();
      }
    };

    bound.thumbsMouseLeave = function () {
      syncThumbScroll(currentRealIndex(), !reducedMotion);
    };

    /* ---------- Enregistrement ---------- */
    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-roledescription', 'carrousel');
    viewport.setAttribute(
      'aria-label',
      root.getAttribute('aria-label') || 'Galerie photos et vidéos du cabinet'
    );

    track.addEventListener('transitionend', bound.transitionEnd);
    viewport.addEventListener('keydown', bound.keydownViewport);
    viewport.addEventListener('pointerdown', bound.pointerDown);
    viewport.addEventListener('pointermove', bound.pointerMove);
    viewport.addEventListener('pointerup', bound.pointerUp);
    viewport.addEventListener('pointercancel', bound.pointerCancel);
    slidesOnTrack.forEach(function (fig) {
      var ob = fig.querySelector('.cabinet-media-carousel__open');
      if (ob) {
        ob.addEventListener('mouseenter', bound.openMouseEnter);
        ob.addEventListener('mouseleave', bound.openMouseLeave);
      }
    });
    window.addEventListener('resize', bound.resize);
    addMediaListener(mqMobile, bound.mq);
    addMediaListener(reducedMotionMq, bound.reduced);
    thumbsContainer.addEventListener('mouseleave', bound.thumbsMouseLeave);

    updateLayoutMode();
    updateActiveStates({ thumbSmooth: false });
    refreshAutoplayState();

    return {
      destroy: function () {
        clearAutoplayTimer();
        track.removeEventListener('transitionend', bound.transitionEnd);
        viewport.removeEventListener('keydown', bound.keydownViewport);
        viewport.removeEventListener('pointerdown', bound.pointerDown);
        viewport.removeEventListener('pointermove', bound.pointerMove);
        viewport.removeEventListener('pointerup', bound.pointerUp);
        viewport.removeEventListener('pointercancel', bound.pointerCancel);
        slidesOnTrack.forEach(function (fig) {
          var ob = fig.querySelector('.cabinet-media-carousel__open');
          if (ob) {
            ob.removeEventListener('mouseenter', bound.openMouseEnter);
            ob.removeEventListener('mouseleave', bound.openMouseLeave);
          }
        });
        window.removeEventListener('resize', bound.resize);
        removeMediaListener(mqMobile, bound.mq);
        removeMediaListener(reducedMotionMq, bound.reduced);
        thumbsContainer.removeEventListener('mouseleave', bound.thumbsMouseLeave);

        closeLightbox();
        if (lightboxEl && lightboxEl.parentNode) {
          lightboxEl.parentNode.removeChild(lightboxEl);
          lightboxEl = null;
        }

        pauseAllVideosExcept(null);
        if (resizeRaf) {
          window.cancelAnimationFrame(resizeRaf);
          resizeRaf = null;
        }
      }
    };
  }

  window.initCabinetMediaCarousel = initCabinetMediaCarousel;

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('cabinet-media-carousel');
    if (el) initCabinetMediaCarousel(el);
  });
})();
