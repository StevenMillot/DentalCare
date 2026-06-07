/* Généré — ne pas éditer. Source: js/src/carousel/ — npm run js:bundle */
(() => {
  // js/src/carousel/constants.js
  var CONFIG = {
    MOBILE_MQ: "(max-width: 767px)",
    SWIPE_THRESHOLD_PX: 48,
    SWIPE_RATIO: 1.2,
    DEFAULT_AUTOPLAY_MS: 5200,
    INTERACTION_RESUME_MS: 4e3,
    THUMB_INTERACTION_RESUME_MS: 5e3,
    LIGHTBOX_FADE_MS: 180,
    SLIDE_GAP_PX: 20,
    PEEK_EACH_SIDE: 0.2,
    NAV_ARROW_PATHS: {
      prev: "M14 6 8 12l6 6 1.4-1.4L10.8 12l4.6-4.6z",
      next: "M10 6 16 12l-6 6-1.4-1.4L13.2 12l-4.6-4.6z"
    },
    PLAY_ICON_PATH: "M8 5v14l11-7z"
  };

  // js/src/carousel/utils.js
  function bindMediaQuery(mq, fn) {
    if (mq.addEventListener) mq.addEventListener("change", fn);
    else if (mq.addListener) mq.addListener(fn);
  }
  function unbindMediaQuery(mq, fn) {
    if (mq.removeEventListener) mq.removeEventListener("change", fn);
    else if (mq.removeListener) mq.removeListener(fn);
  }
  function navArrowSvg(direction) {
    return `<svg class="icon icon--primary" viewBox="0 0 24 24" aria-hidden="true"><path d="${CONFIG.NAV_ARROW_PATHS[direction]}"/></svg>`;
  }
  function createNavButton(direction, classPrefix) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `${classPrefix}__nav ${classPrefix}__nav--${direction}`;
    btn.setAttribute(
      "aria-label",
      direction === "prev" ? "M\xE9dia pr\xE9c\xE9dent" : "M\xE9dia suivant"
    );
    btn.innerHTML = navArrowSvg(direction);
    return btn;
  }
  function cloneSlide(el, isClone) {
    const clone = el.cloneNode(true);
    clone.setAttribute("data-cabinet-clone", isClone ? "true" : "false");
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("id");
    const openBtn = clone.querySelector(".cabinet-media-carousel__open");
    if (openBtn) openBtn.setAttribute("tabindex", "-1");
    return clone;
  }
  function getFocusable(container) {
    return [...container.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((el) => {
      const st = window.getComputedStyle(el);
      if (st.visibility === "hidden" || st.display === "none") return false;
      if (st.position === "fixed") return true;
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  // js/src/carousel/init.js
  function initCabinetMediaCarousel(root) {
    if (!root) return null;
    const stage = root.querySelector(".cabinet-media-carousel__stage");
    const viewport = root.querySelector(".cabinet-media-carousel__viewport");
    const track = root.querySelector(".cabinet-media-carousel__track");
    const thumbsContainer = root.querySelector(".cabinet-media-carousel__thumbs");
    if (!stage || !viewport || !track || !thumbsContainer) return null;
    const originals = [...track.querySelectorAll("[data-cabinet-slide]")];
    if (originals.length === 0) return null;
    const n = originals.length;
    let positionIndex = n >= 2 ? 1 : 0;
    let isInstant = false;
    let autoplayTimer = null;
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionMq.matches;
    const mqMobile = window.matchMedia(CONFIG.MOBILE_MQ);
    let isMobile = mqMobile.matches;
    let autoplayInterval = parseInt(root.getAttribute("data-autoplay-interval"), 10);
    if (Number.isNaN(autoplayInterval) || autoplayInterval < 2e3) {
      autoplayInterval = CONFIG.DEFAULT_AUTOPLAY_MS;
    }
    let hoverPause = false;
    let interactionPause = false;
    let interactionResumeTimer = null;
    let suppressOpenClick = false;
    let slideWidthPx = 0;
    let gapPx = CONFIG.SLIDE_GAP_PX;
    let offsetPx = 0;
    let lastFocusEl = null;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let dragging = false;
    let resizeRaf = null;
    const bound = {
      resize: null,
      mq: null,
      reduced: null,
      transitionEnd: null,
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
    let lightboxEl = null;
    let lightboxMediaHost = null;
    let lightboxVideoEl = null;
    let lightboxNavPrev = null;
    let lightboxNavNext = null;
    let lightboxIndex = 0;
    let lightboxFadeTimer = null;
    let scrollLockY = 0;
    let lightboxInertNodes = [];
    const canUseInert = typeof HTMLElement !== "undefined" && "inert" in HTMLElement.prototype;
    const thumbsClickCtrl = new AbortController();
    const slideOpenCtrl = new AbortController();
    const navClickCtrl = new AbortController();
    const navPrev = createNavButton("prev", "cabinet-media-carousel");
    const navNext = createNavButton("next", "cabinet-media-carousel");
    stage.appendChild(navPrev);
    stage.appendChild(navNext);
    function updateNavVisibility() {
      const show = n >= 2;
      navPrev.hidden = !show;
      navNext.hidden = !show;
    }
    track.textContent = "";
    if (n >= 2) {
      track.appendChild(cloneSlide(originals[n - 1], true));
      originals.forEach((fig) => {
        track.appendChild(fig);
      });
      track.appendChild(cloneSlide(originals[0], true));
    } else {
      track.appendChild(originals[0]);
    }
    const slidesOnTrack = [...track.querySelectorAll("[data-cabinet-slide]")];
    const carouselPanelId = `${root.id}-panel`;
    thumbsContainer.textContent = "";
    originals.forEach((fig, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cabinet-media-carousel__thumb";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        `${fig.getAttribute("data-label") || `M\xE9dia ${i + 1}`}. Espace : afficher dans le carrousel. Entr\xE9e : agrandir.`
      );
      btn.setAttribute("id", `${root.id}-tab-${i}`);
      btn.setAttribute("aria-controls", carouselPanelId);
      const thumbSrc = fig.getAttribute("data-thumb") || fig.querySelector("img") && fig.querySelector("img").getAttribute("src") || fig.querySelector("video") && fig.querySelector("video").getAttribute("poster") || "";
      const im = document.createElement("img");
      im.src = thumbSrc;
      im.alt = "";
      im.decoding = "async";
      im.loading = "lazy";
      btn.appendChild(im);
      if (fig.querySelector("video")) {
        btn.classList.add("cabinet-media-carousel__thumb--video");
        const playBadge = document.createElement("span");
        playBadge.className = "cabinet-media-carousel__badge-video cabinet-media-carousel__badge-video--thumb";
        playBadge.setAttribute("aria-hidden", "true");
        playBadge.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${CONFIG.PLAY_ICON_PATH}"/></svg>`;
        btn.appendChild(playBadge);
      }
      btn.addEventListener(
        "click",
        () => {
          goToRealIndex(i);
          bumpInteractionPause(CONFIG.THUMB_INTERACTION_RESUME_MS);
        },
        { signal: thumbsClickCtrl.signal }
      );
      thumbsContainer.appendChild(btn);
    });
    const thumbButtons = [...thumbsContainer.querySelectorAll(".cabinet-media-carousel__thumb")];
    function layoutMetrics() {
      const w = viewport.clientWidth;
      if (w <= 0) return;
      gapPx = CONFIG.SLIDE_GAP_PX;
      slideWidthPx = w / (1 + 2 * CONFIG.PEEK_EACH_SIDE);
      offsetPx = w / 2 - slideWidthPx / 2;
      const count = slidesOnTrack.length;
      const trackW = count * slideWidthPx + Math.max(0, count - 1) * gapPx;
      track.style.width = `${trackW}px`;
      track.style.gap = `${gapPx}px`;
      slidesOnTrack.forEach((sl) => {
        sl.style.width = `${slideWidthPx}px`;
        sl.style.flexBasis = `${slideWidthPx}px`;
      });
    }
    function translateForPosition(p) {
      return offsetPx - p * (slideWidthPx + gapPx);
    }
    function applyTranslate() {
      const tx = translateForPosition(positionIndex);
      track.style.transform = `translate3d(${tx}px,0,0)`;
    }
    function setInstant(on) {
      isInstant = on;
      if (on) root.classList.add("cabinet-media-carousel--instant");
      else root.classList.remove("cabinet-media-carousel--instant");
    }
    function updateLayoutMode() {
      isMobile = mqMobile.matches;
      root.classList.toggle("cabinet-media-carousel--mobile", isMobile);
      root.classList.toggle("cabinet-media-carousel--desktop", !isMobile);
      layoutMetrics();
      applyTranslate();
    }
    function positionToRealIndex(p) {
      if (n < 2) return 0;
      if (p === 0) return n - 1;
      if (p === n + 1) return 0;
      return p - 1;
    }
    function currentRealIndex() {
      return positionToRealIndex(positionIndex);
    }
    function updateActiveStates(opts = {}) {
      let thumbSmooth = opts.thumbSmooth !== false;
      if (reducedMotion) thumbSmooth = false;
      const ri = currentRealIndex();
      slidesOnTrack.forEach((sl, idx) => {
        const r = positionToRealIndex(idx);
        sl.classList.toggle("is-active", r === ri);
      });
      thumbButtons.forEach((tb, i) => {
        tb.setAttribute("aria-selected", i === ri ? "true" : "false");
      });
      syncThumbScroll(ri, thumbSmooth);
      pauseAllVideosExcept(null);
      updateTabStops();
    }
    function updateTabStops() {
      const ri = currentRealIndex();
      slidesOnTrack.forEach((sl) => {
        const active = sl.classList.contains("is-active");
        sl.setAttribute("aria-hidden", active ? "false" : "true");
        const ob = sl.querySelector(".cabinet-media-carousel__open");
        if (ob) ob.tabIndex = -1;
      });
      thumbButtons.forEach((tb) => {
        tb.tabIndex = 0;
      });
      if (thumbButtons[ri]) {
        viewport.setAttribute("aria-labelledby", thumbButtons[ri].id);
      }
    }
    function syncThumbScroll(ri, smooth) {
      const btn = thumbButtons[ri];
      const c = thumbsContainer;
      if (!btn || !c) return;
      if (typeof c.matches === "function" && c.matches(":hover")) {
        return;
      }
      function scrollToActive() {
        const cRect = c.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();
        const delta = bRect.left + bRect.width / 2 - cRect.left - cRect.width / 2;
        let nextLeft = c.scrollLeft + delta;
        const maxS = Math.max(0, c.scrollWidth - c.clientWidth);
        nextLeft = Math.max(0, Math.min(nextLeft, maxS));
        if (smooth && typeof c.scrollTo === "function") {
          try {
            c.scrollTo({ left: nextLeft, behavior: "smooth" });
            return;
          } catch (e) {
          }
        }
        c.scrollLeft = nextLeft;
      }
      scrollToActive();
      if (smooth) {
        window.requestAnimationFrame(() => {
          scrollToActive();
        });
      }
    }
    function getVideoEls() {
      return [...track.querySelectorAll("video")];
    }
    function pauseAllVideosExcept(videoToKeep) {
      getVideoEls().forEach((v) => {
        if (v !== videoToKeep) {
          v.pause();
        }
      });
    }
    function clearAutoplayTimer() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }
    function clearInteractionPauseTimer() {
      if (interactionResumeTimer) {
        clearTimeout(interactionResumeTimer);
        interactionResumeTimer = null;
      }
    }
    function shouldRunAutoplay() {
      if (reducedMotion || n < 2) return false;
      if (hoverPause) return false;
      if (interactionPause) return false;
      return true;
    }
    function refreshAutoplayState({ runFirstTickNow = false } = {}) {
      clearAutoplayTimer();
      if (!shouldRunAutoplay()) return;
      if (runFirstTickNow) {
        moveNext();
      }
      autoplayTimer = window.setInterval(() => {
        if (!shouldRunAutoplay()) return;
        moveNext();
      }, autoplayInterval);
    }
    function bumpInteractionPause(ms = CONFIG.INTERACTION_RESUME_MS) {
      clearInteractionPauseTimer();
      interactionPause = true;
      refreshAutoplayState();
      interactionResumeTimer = window.setTimeout(() => {
        interactionResumeTimer = null;
        interactionPause = false;
        refreshAutoplayState({ runFirstTickNow: true });
      }, ms);
    }
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
      const normalized = (ri % n + n) % n;
      if (n < 2) {
        positionIndex = 0;
        setInstant(false);
        applyTranslate();
        updateActiveStates();
        return;
      }
      const target = normalized + 1;
      setInstant(false);
      positionIndex = target;
      applyTranslate();
      updateActiveStates();
    }
    function onTransitionEnd(e) {
      if (e.target !== track || e.propertyName !== "transform") return;
      if (n < 2) return;
      if (positionIndex === n + 1) {
        setInstant(true);
        positionIndex = 1;
        applyTranslate();
        updateActiveStates({ thumbSmooth: true });
        window.requestAnimationFrame(() => {
          setInstant(false);
        });
      } else if (positionIndex === 0) {
        setInstant(true);
        positionIndex = n;
        applyTranslate();
        updateActiveStates({ thumbSmooth: true });
        window.requestAnimationFrame(() => {
          setInstant(false);
        });
      }
    }
    function onPointerDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target?.closest?.(".cabinet-media-carousel__open")) {
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
      } catch (err) {
      }
    }
    function onPointerMove(e) {
      if (!dragging || e.pointerId !== pointerId) return;
    }
    function onPointerUp(e) {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (err) {
      }
      pointerId = null;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < CONFIG.SWIPE_THRESHOLD_PX) return;
      if (Math.abs(dx) < Math.abs(dy) * CONFIG.SWIPE_RATIO) return;
      suppressOpenClick = true;
      if (dx < 0) moveNext();
      else movePrev();
    }
    function applyLightboxInert() {
      if (!canUseInert || !lightboxEl) return;
      removeLightboxInert();
      lightboxInertNodes = [...document.body.children].filter((node) => node !== lightboxEl);
      lightboxInertNodes.forEach((node) => {
        node.setAttribute("inert", "");
      });
    }
    function removeLightboxInert() {
      lightboxInertNodes.forEach((node) => {
        node.removeAttribute("inert");
      });
      lightboxInertNodes = [];
    }
    function onLightboxFocusIn(e) {
      if (!lightboxEl || !lightboxEl.classList.contains("is-open")) return;
      if (lightboxEl.contains(e.target)) return;
      const closeBtn = lightboxEl.querySelector(".cabinet-lightbox__close");
      if (closeBtn) closeBtn.focus();
    }
    function onRootKeydown(e) {
      if (lightboxEl && lightboxEl.classList.contains("is-open")) return;
      const ac = document.activeElement;
      if (!ac || !root.contains(ac)) return;
      const thumbIdx = thumbButtons.indexOf(ac);
      if (thumbIdx >= 0) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const ni = Math.min(n - 1, thumbIdx + 1);
          if (ni !== thumbIdx) {
            goToRealIndex(ni);
            thumbButtons[ni].focus();
          }
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const ni = Math.max(0, thumbIdx - 1);
          if (ni !== thumbIdx) {
            goToRealIndex(ni);
            thumbButtons[ni].focus();
          }
        } else if (e.key === "Home") {
          e.preventDefault();
          goToRealIndex(0);
          thumbButtons[0].focus();
        } else if (e.key === "End") {
          e.preventDefault();
          goToRealIndex(n - 1);
          thumbButtons[n - 1].focus();
        } else if (e.key === "Enter") {
          e.preventDefault();
          goToRealIndex(thumbIdx);
          openLightboxFromSlide(originals[thumbIdx]);
        } else if (e.key === " ") {
          e.preventDefault();
          goToRealIndex(thumbIdx);
        }
        return;
      }
    }
    function updateLightboxNavVisibility() {
      if (!lightboxNavPrev || !lightboxNavNext) return;
      const show = n >= 2 && lightboxEl && lightboxEl.classList.contains("is-open");
      lightboxNavPrev.hidden = !show;
      lightboxNavNext.hidden = !show;
    }
    function renderLightboxMedia(fig) {
      if (!lightboxMediaHost) return;
      if (lightboxVideoEl) {
        lightboxVideoEl.pause();
        lightboxVideoEl.removeAttribute("src");
        lightboxVideoEl.load();
        lightboxVideoEl = null;
      }
      lightboxMediaHost.textContent = "";
      const img = fig.querySelector(".cabinet-media-carousel__media img");
      const vid = fig.querySelector(".cabinet-media-carousel__media video");
      if (vid) {
        const v = document.createElement("video");
        v.setAttribute("controls", "");
        v.muted = true;
        v.playsInline = true;
        if (vid.poster) v.poster = vid.poster;
        const sources = vid.querySelectorAll("source");
        if (sources.length) {
          sources.forEach((s) => {
            const ns = document.createElement("source");
            ns.src = s.getAttribute("src") || "";
            if (s.getAttribute("type")) ns.type = s.getAttribute("type");
            v.appendChild(ns);
          });
        } else if (vid.src) {
          v.src = vid.src;
        } else if (vid.currentSrc) {
          v.src = vid.currentSrc;
        }
        v.tabIndex = -1;
        lightboxMediaHost.appendChild(v);
        lightboxVideoEl = v;
        v.load();
        v.play().catch(() => {
        });
      } else if (img) {
        const ni = document.createElement("img");
        ni.src = img.currentSrc || img.src;
        ni.alt = img.alt || "";
        lightboxMediaHost.appendChild(ni);
      }
    }
    function clearLightboxFadeTimer() {
      if (lightboxFadeTimer) {
        clearTimeout(lightboxFadeTimer);
        lightboxFadeTimer = null;
      }
    }
    function updateLightboxMeta(fig, ri) {
      goToRealIndex(ri);
      if (lightboxEl) {
        const label = fig.getAttribute("data-label") || `M\xE9dia ${ri + 1}`;
        lightboxEl.setAttribute("aria-label", `Vue agrandie : ${label}`);
      }
    }
    function setLightboxContent(ri, opts = {}) {
      const normalized = (ri % n + n) % n;
      if (normalized === lightboxIndex && lightboxMediaHost?.firstElementChild && opts.animate) {
        return;
      }
      lightboxIndex = normalized;
      const fig = originals[normalized];
      const animate = opts.animate === true && !reducedMotion && lightboxEl && lightboxEl.classList.contains("is-open") && lightboxMediaHost && lightboxMediaHost.firstElementChild;
      clearLightboxFadeTimer();
      if (!animate) {
        lightboxMediaHost?.classList.remove("cabinet-lightbox__body--fade");
        renderLightboxMedia(fig);
        updateLightboxMeta(fig, normalized);
        return;
      }
      lightboxMediaHost.classList.add("cabinet-lightbox__body--fade");
      lightboxFadeTimer = window.setTimeout(() => {
        lightboxFadeTimer = null;
        renderLightboxMedia(fig);
        updateLightboxMeta(fig, normalized);
        lightboxMediaHost.classList.remove("cabinet-lightbox__body--fade");
      }, CONFIG.LIGHTBOX_FADE_MS);
    }
    function navigateLightbox(delta) {
      if (n < 2 || !lightboxEl || !lightboxEl.classList.contains("is-open")) return;
      setLightboxContent(lightboxIndex + delta, { animate: true });
      bumpInteractionPause();
    }
    function ensureLightbox() {
      if (lightboxEl) return;
      lightboxEl = document.createElement("div");
      lightboxEl.className = "cabinet-lightbox";
      lightboxEl.setAttribute("role", "dialog");
      lightboxEl.setAttribute("aria-modal", "true");
      lightboxEl.setAttribute("aria-label", "Vue agrandie");
      lightboxEl.setAttribute("aria-hidden", "true");
      lightboxEl.innerHTML = '<div class="cabinet-lightbox__backdrop" tabindex="-1" aria-hidden="true"></div><button type="button" class="cabinet-lightbox__close" aria-label="Fermer la vue agrandie"><svg class="cabinet-lightbox__close-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="none" d="M5.5 5.5l13 13m0-13l-13 13" /></svg></button><div class="cabinet-lightbox__content"><div class="cabinet-lightbox__body" role="document"></div><div class="cabinet-lightbox__nav-bar"></div></div>';
      document.body.appendChild(lightboxEl);
      lightboxMediaHost = lightboxEl.querySelector(".cabinet-lightbox__body");
      const backdrop = lightboxEl.querySelector(".cabinet-lightbox__backdrop");
      const closeBtn = lightboxEl.querySelector(".cabinet-lightbox__close");
      const navBar = lightboxEl.querySelector(".cabinet-lightbox__nav-bar");
      lightboxNavPrev = createNavButton("prev", "cabinet-lightbox");
      lightboxNavNext = createNavButton("next", "cabinet-lightbox");
      navBar.appendChild(lightboxNavPrev);
      navBar.appendChild(lightboxNavNext);
      backdrop.addEventListener("click", closeLightbox);
      closeBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        closeLightbox();
      });
      lightboxNavPrev.addEventListener("click", (ev) => {
        ev.stopPropagation();
        navigateLightbox(-1);
      });
      lightboxNavNext.addEventListener("click", (ev) => {
        ev.stopPropagation();
        navigateLightbox(1);
      });
      bound.lightboxKey = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeLightbox();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateLightbox(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          navigateLightbox(1);
        }
      };
      bound.focusTrap = (e) => {
        if (e.key !== "Tab" || !lightboxEl.classList.contains("is-open")) return;
        const focusables = getFocusable(lightboxEl);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (focusables.length === 1) {
          e.preventDefault();
          first.focus();
          return;
        }
        if (e.shiftKey) {
          if (active === first || !lightboxEl.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !lightboxEl.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      };
    }
    function lockScroll() {
      scrollLockY = window.scrollY || window.pageYOffset;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollLockY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }
    function unlockScroll() {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollLockY);
    }
    function openLightboxFromSlide(fig) {
      ensureLightbox();
      const ri = originals.indexOf(fig);
      if (ri < 0) return;
      const hasMedia = fig.querySelector(".cabinet-media-carousel__media img") || fig.querySelector(".cabinet-media-carousel__media video");
      if (!hasMedia) return;
      lastFocusEl = document.activeElement;
      setLightboxContent(ri);
      pauseAllVideosExcept(null);
      lightboxEl.classList.add("is-open");
      lightboxEl.setAttribute("aria-hidden", "false");
      updateLightboxNavVisibility();
      lockScroll();
      applyLightboxInert();
      document.addEventListener("keydown", bound.lightboxKey);
      document.addEventListener("keydown", bound.focusTrap);
      document.addEventListener("focusin", onLightboxFocusIn, true);
      const closeB = lightboxEl.querySelector(".cabinet-lightbox__close");
      const focusClose = () => {
        if (closeB) closeB.focus({ preventScroll: true });
      };
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(focusClose);
      });
      window.setTimeout(focusClose, 0);
    }
    function closeLightbox() {
      if (!lightboxEl || !lightboxEl.classList.contains("is-open")) return;
      clearLightboxFadeTimer();
      lightboxMediaHost?.classList.remove("cabinet-lightbox__body--fade");
      document.removeEventListener("keydown", bound.lightboxKey);
      document.removeEventListener("keydown", bound.focusTrap);
      document.removeEventListener("focusin", onLightboxFocusIn, true);
      removeLightboxInert();
      lightboxEl.classList.remove("is-open");
      lightboxEl.setAttribute("aria-hidden", "true");
      unlockScroll();
      if (lightboxVideoEl) {
        lightboxVideoEl.pause();
        lightboxVideoEl.removeAttribute("src");
        lightboxVideoEl.load();
        lightboxVideoEl = null;
      }
      lightboxMediaHost.textContent = "";
      updateLightboxNavVisibility();
      if (lastFocusEl && typeof lastFocusEl.focus === "function") {
        lastFocusEl.focus();
      }
      lastFocusEl = null;
    }
    slidesOnTrack.forEach((fig) => {
      const openBtn = fig.querySelector(".cabinet-media-carousel__open");
      if (!openBtn) return;
      openBtn.addEventListener(
        "click",
        (ev) => {
          if (!fig.classList.contains("is-active")) {
            ev.preventDefault();
            ev.stopPropagation();
            return;
          }
          if (suppressOpenClick) {
            ev.preventDefault();
            ev.stopPropagation();
            suppressOpenClick = false;
            return;
          }
          let targetFig = fig;
          if (fig.getAttribute("data-cabinet-clone") === "true") {
            const idx = slidesOnTrack.indexOf(fig);
            targetFig = originals[positionToRealIndex(idx)];
          }
          ev.preventDefault();
          ev.stopPropagation();
          openLightboxFromSlide(targetFig);
        },
        { signal: slideOpenCtrl.signal }
      );
    });
    bound.reduced = () => {
      reducedMotion = reducedMotionMq.matches;
      refreshAutoplayState();
    };
    bound.resize = () => {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        layoutMetrics();
        applyTranslate();
      });
    };
    bound.mq = () => {
      updateLayoutMode();
    };
    bound.transitionEnd = onTransitionEnd;
    bound.rootKeydown = onRootKeydown;
    bound.pointerDown = onPointerDown;
    bound.pointerMove = onPointerMove;
    bound.pointerUp = onPointerUp;
    bound.pointerCancel = onPointerUp;
    bound.openMouseEnter = (e) => {
      const sl = e.currentTarget.closest(".cabinet-media-carousel__slide");
      if (sl && sl.classList.contains("is-active")) {
        hoverPause = true;
        refreshAutoplayState();
      }
    };
    bound.openMouseLeave = (e) => {
      const sl = e.currentTarget.closest(".cabinet-media-carousel__slide");
      if (sl && sl.classList.contains("is-active")) {
        hoverPause = false;
        refreshAutoplayState();
      }
    };
    bound.thumbsMouseLeave = () => {
      syncThumbScroll(currentRealIndex(), !reducedMotion);
    };
    navPrev.addEventListener(
      "click",
      () => {
        movePrev();
        bumpInteractionPause();
      },
      { signal: navClickCtrl.signal }
    );
    navNext.addEventListener(
      "click",
      () => {
        moveNext();
        bumpInteractionPause();
      },
      { signal: navClickCtrl.signal }
    );
    viewport.id = carouselPanelId;
    viewport.setAttribute("tabindex", "-1");
    viewport.setAttribute("role", "tabpanel");
    thumbsContainer.setAttribute("aria-orientation", "horizontal");
    track.addEventListener("transitionend", bound.transitionEnd);
    root.addEventListener("keydown", bound.rootKeydown);
    viewport.addEventListener("pointerdown", bound.pointerDown);
    viewport.addEventListener("pointermove", bound.pointerMove);
    viewport.addEventListener("pointerup", bound.pointerUp);
    viewport.addEventListener("pointercancel", bound.pointerCancel);
    slidesOnTrack.forEach((fig) => {
      const ob = fig.querySelector(".cabinet-media-carousel__open");
      if (ob) {
        ob.addEventListener("mouseenter", bound.openMouseEnter);
        ob.addEventListener("mouseleave", bound.openMouseLeave);
      }
    });
    window.addEventListener("resize", bound.resize);
    bindMediaQuery(mqMobile, bound.mq);
    bindMediaQuery(reducedMotionMq, bound.reduced);
    thumbsContainer.addEventListener("mouseleave", bound.thumbsMouseLeave);
    updateLayoutMode();
    updateNavVisibility();
    updateActiveStates({ thumbSmooth: false });
    refreshAutoplayState();
    return {
      destroy() {
        thumbsClickCtrl.abort();
        slideOpenCtrl.abort();
        navClickCtrl.abort();
        navPrev.remove();
        navNext.remove();
        clearInteractionPauseTimer();
        interactionPause = false;
        clearLightboxFadeTimer();
        clearAutoplayTimer();
        track.removeEventListener("transitionend", bound.transitionEnd);
        root.removeEventListener("keydown", bound.rootKeydown);
        viewport.removeEventListener("pointerdown", bound.pointerDown);
        viewport.removeEventListener("pointermove", bound.pointerMove);
        viewport.removeEventListener("pointerup", bound.pointerUp);
        viewport.removeEventListener("pointercancel", bound.pointerCancel);
        slidesOnTrack.forEach((fig) => {
          const ob = fig.querySelector(".cabinet-media-carousel__open");
          if (ob) {
            ob.removeEventListener("mouseenter", bound.openMouseEnter);
            ob.removeEventListener("mouseleave", bound.openMouseLeave);
          }
        });
        window.removeEventListener("resize", bound.resize);
        unbindMediaQuery(mqMobile, bound.mq);
        unbindMediaQuery(reducedMotionMq, bound.reduced);
        thumbsContainer.removeEventListener("mouseleave", bound.thumbsMouseLeave);
        closeLightbox();
        if (lightboxEl?.parentNode) {
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

  // js/src/script/dom.js
  function onDomReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // js/src/carousel/index.js
  window.initCabinetMediaCarousel = initCabinetMediaCarousel;
  onDomReady(() => {
    const el = document.getElementById("cabinet-media-carousel");
    if (el) initCabinetMediaCarousel(el);
  });
})();
