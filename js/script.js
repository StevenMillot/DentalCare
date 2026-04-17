(function() {
  'use strict';

  // ============================================================================
  // UTILITAIRES LÉGERS
  // ============================================================================

  /**
   * Sélecteur d'élément unique optimisé
   * @param {string} selector - Sélecteur CSS
   * @returns {Element|null} Premier élément correspondant ou null
   * @example
   * const navbar = $('.navbar');
   */
  const $ = (selector) => document.querySelector(selector);

  /**
   * Sélecteur d'éléments multiples optimisé
   * @param {string} selector - Sélecteur CSS
   * @returns {NodeList} Liste des éléments correspondants
   * @example
   * const cards = $$('.card');
   */
  const $$ = (selector) => document.querySelectorAll(selector);

  /**
   * Fonction debounce optimisée pour limiter les appels fréquents
   * @param {Function} func - Fonction à débouncer
   * @param {number} wait - Délai d'attente en millisecondes
   * @returns {Function} Fonction débouncée
   * @example
   * const debouncedScroll = debounce(handleScroll, 100);
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Reporter l'exécution après le rendu critique pour optimiser les performances
   * @param {Function} fn - Fonction à exécuter de manière différée
   * @example
   * defer(() => initAnimations());
   */
  function defer(fn) {
    if (window.requestIdleCallback) {
      requestIdleCallback(fn, { timeout: 100 });
    } else {
      setTimeout(fn, 1);
    }
  }

  /** Détache les écouteurs document du menu mobile (resize → desktop, etc.) */
  let releaseMobileMenuDocListeners = () => {};

  /**
   * Toasts empilés (max 4), texte sûr (textContent), auto-fermeture, rôles a11y.
   * @type {{ success: function(string): void, error: function(string): void, info: function(string): void, warning: function(string): void }}
   */
  const notify = (() => {
    const MAX = 4;
    const AUTO_MS = { success: 6500, info: 5500, error: 10000, warning: 8000 };
    const stack = [];

    function symbolFor(kind) {
      if (kind === 'success') return 'i-check-circle';
      if (kind === 'error') return 'i-alert-circle';
      if (kind === 'warning') return 'i-alert-triangle';
      return 'i-info';
    }

    function trimStack() {
      while (stack.length >= MAX) {
        const old = stack.shift();
        if (old.timer) clearTimeout(old.timer);
        if (old.el && old.el.parentNode) old.el.remove();
      }
    }

    function dismiss(el) {
      const i = stack.findIndex((t) => t.el === el);
      if (i >= 0) {
        if (stack[i].timer) clearTimeout(stack[i].timer);
        stack.splice(i, 1);
      }
      if (!el || !el.parentNode) return;
      el.classList.add('toast--leaving');
      window.setTimeout(() => {
        if (el.parentNode) el.remove();
      }, 280);
    }

    function show(message, kind = 'info') {
      if (!message || typeof message !== 'string') return;
      trimStack();

      const el = document.createElement('div');
      el.className = `toast toast--${kind}`;
      el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
      el.setAttribute('aria-live', kind === 'error' ? 'assertive' : 'polite');

      const row = document.createElement('div');
      row.className = 'toast__row';

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'toast__icon icon');
      icon.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', `#${symbolFor(kind)}`);
      icon.appendChild(use);

      const text = document.createElement('p');
      text.className = 'toast__text';
      text.textContent = message;

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'toast__close';
      closeBtn.setAttribute('aria-label', 'Fermer la notification');
      const closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      closeSvg.setAttribute('class', 'icon');
      closeSvg.setAttribute('aria-hidden', 'true');
      const closeUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      closeUse.setAttribute('href', '#i-x');
      closeSvg.appendChild(closeUse);
      closeBtn.appendChild(closeSvg);

      row.appendChild(icon);
      row.appendChild(text);
      el.appendChild(row);
      el.appendChild(closeBtn);

      const host = document.getElementById('toast-host') || document.body;
      host.appendChild(el);

      const entry = { el, timer: null };
      stack.push(entry);

      window.requestAnimationFrame(() => el.classList.add('toast--visible'));

      const ms = AUTO_MS[kind] || AUTO_MS.info;
      entry.timer = window.setTimeout(() => dismiss(el), ms);

      closeBtn.addEventListener('click', () => {
        if (entry.timer) clearTimeout(entry.timer);
        entry.timer = null;
        dismiss(el);
      });
    }

    return {
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error'),
      info: (m) => show(m, 'info'),
      warning: (m) => show(m, 'warning'),
    };
  })();

  // ============================================================================
  // NAVIGATION - Initialisation différée
  // ============================================================================

  /**
   * Initialise la navigation mobile et les effets de scroll
   * Gère le menu hamburger, la navigation sticky et l'accessibilité
   * @function initNavigation
   * @example
   * initNavigation();
   */
  function initNavigation() {
    const navbar = $('.navbar');
    const navbarToggle = $('.navbar__toggle');
    const navbarMenu = $('.navbar__menu--mobile');
    const navbarLinks = $$('.navbar__link');

    /* Listeners document (Escape / clic extérieur) uniquement quand le menu est ouvert
     * — évite deux écouteurs permanents sur document. */
    if (navbarToggle && navbarMenu) {
      let docListenersAttached = false;

      function removeMobileMenuDocListeners() {
        if (!docListenersAttached) return;
        document.removeEventListener('keydown', onDocKeydownEscape);
        document.removeEventListener('click', onDocClickOutside, true);
        docListenersAttached = false;
      }

      releaseMobileMenuDocListeners = removeMobileMenuDocListeners;

      function closeMobileMenu() {
        navbarToggle.setAttribute('aria-expanded', 'false');
        navbarMenu.classList.remove('navbar__menu--active');
        removeMobileMenuDocListeners();
      }

      function onDocKeydownEscape(e) {
        if (e.key !== 'Escape') return;
        if (!navbarMenu.classList.contains('navbar__menu--active')) return;
        e.preventDefault();
        closeMobileMenu();
        navbarToggle.focus();
      }

      function onDocClickOutside(e) {
        if (!navbarMenu.classList.contains('navbar__menu--active')) return;
        if (navbarMenu.contains(e.target) || navbarToggle.contains(e.target)) return;
        closeMobileMenu();
      }

      function openMobileMenuDocListeners() {
        if (docListenersAttached) return;
        docListenersAttached = true;
        /* setTimeout : évite que le clic d’ouverture ne déclenche tout de suite le « outside » */
        window.setTimeout(() => {
          document.addEventListener('keydown', onDocKeydownEscape);
          document.addEventListener('click', onDocClickOutside, true);
        }, 0);
      }

      navbarToggle.addEventListener('click', () => {
        const isExpanded = navbarToggle.getAttribute('aria-expanded') === 'true';
        const willOpen = !isExpanded;
        navbarToggle.setAttribute('aria-expanded', willOpen);
        navbarMenu.classList.toggle('navbar__menu--active', willOpen);

        if (willOpen) {
          const firstLink = navbarMenu.querySelector('.navbar__link');
          if (firstLink) firstLink.focus();
          openMobileMenuDocListeners();
        } else {
          removeMobileMenuDocListeners();
          navbarToggle.focus();
        }
      });

      navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (navbarMenu.classList.contains('navbar__menu--active')) {
            closeMobileMenu();
          }
        });
      });
    }

    // Navigation sticky
    if (navbar) {
      const handleScroll = debounce(() => {
        if (window.scrollY > 100) {
          navbar.classList.add('navbar--scrolled');
        } else {
          navbar.classList.remove('navbar--scrolled');
        }
      }, 10);

      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  }

  // ============================================================================
  // SMOOTH SCROLL - Initialisation différée
  // ============================================================================

  /**
   * Initialise le scroll fluide pour les liens d'ancrage
   * Ajoute un offset pour compenser la hauteur de la navbar fixe
   * @function initSmoothScroll
   * @example
   * initSmoothScroll();
   */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));

        if (target) {
          const offsetTop = target.offsetTop - 70;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ============================================================================
  // FORMULAIRE - Initialisation différée
  // ============================================================================

  /**
   * Initialise la gestion du formulaire de prise de rendez-vous
   * Inclut la validation en temps réel et la gestion des erreurs
   * @function initForm
   * @example
   * initForm();
   */
  function initForm() {
    const appointmentForm = $('#appointmentForm');
    if (!appointmentForm) return;

    const formBanner = $('#appointmentForm-banner');
    const formInputs = $$('#appointmentForm .form__input, #appointmentForm .form__select, #appointmentForm .form__textarea');
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');

    const VALIDATED_IDS = new Set(['given-name', 'family-name', 'email', 'phone', 'service']);

    function clearFieldInvalid(field) {
      field.classList.remove('form__input--error', 'form__select--error', 'form__textarea--error');
    }

    function setFieldInvalid(field) {
      clearFieldInvalid(field);
      if (field.matches('select')) field.classList.add('form__select--error');
      else if (field.matches('textarea')) field.classList.add('form__textarea--error');
      else field.classList.add('form__input--error');
    }

    function setFieldError(field, message) {
      if (!field || !field.id || !VALIDATED_IDS.has(field.id)) return;
      const errEl = document.getElementById(`err-${field.id}`);
      if (message) {
        setFieldInvalid(field);
        field.setAttribute('aria-invalid', 'true');
        if (errEl) {
          errEl.textContent = message;
          errEl.hidden = false;
        }
      } else {
        clearFieldInvalid(field);
        field.removeAttribute('aria-invalid');
        if (errEl) {
          errEl.textContent = '';
          errEl.hidden = true;
        }
      }
    }

    function validateEmailValue(raw) {
      const v = raw.trim();
      if (!v) return 'Indiquez votre adresse e-mail.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Format d’adresse e-mail invalide.';
      return '';
    }

    function validatePhoneValue(raw) {
      const digits = String(raw).replace(/\D/g, '');
      if (!String(raw).trim()) return 'Indiquez un numéro de téléphone.';
      if (digits.length < 10) {
        return 'Saisissez au moins 10 chiffres (avec ou sans espaces).';
      }
      return '';
    }

    function getValidationMessage(field) {
      switch (field.id) {
        case 'given-name':
          return field.value.trim() ? '' : 'Indiquez votre prénom.';
        case 'family-name':
          return field.value.trim() ? '' : 'Indiquez votre nom.';
        case 'email':
          return validateEmailValue(field.value);
        case 'phone':
          return validatePhoneValue(field.value);
        case 'service':
          return field.value ? '' : 'Choisissez un motif de consultation.';
        default:
          return '';
      }
    }

    function clearFormBanner() {
      if (!formBanner) return;
      formBanner.hidden = true;
      formBanner.textContent = '';
    }

    function showFormBanner(errorCount) {
      if (!formBanner || errorCount < 1) return;
      formBanner.hidden = false;
      formBanner.textContent =
        errorCount === 1
          ? 'Veuillez corriger le champ indiqué ci-dessous.'
          : `Veuillez corriger les ${errorCount} champs indiqués ci-dessous.`;
    }

    function clearAllFormErrors() {
      VALIDATED_IDS.forEach((id) => {
        const f = document.getElementById(id);
        if (f) setFieldError(f, '');
      });
      clearFormBanner();
    }

    function validateAllForm() {
      const fields = ['given-name', 'family-name', 'email', 'phone', 'service']
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      let firstInvalid = null;
      let errorCount = 0;

      fields.forEach((field) => {
        const msg = getValidationMessage(field);
        if (msg) {
          setFieldError(field, msg);
          errorCount += 1;
          if (!firstInvalid) firstInvalid = field;
        } else {
          setFieldError(field, '');
        }
      });

      clearFormBanner();
      if (errorCount > 0) showFormBanner(errorCount);

      return { ok: errorCount === 0, firstInvalid };
    }

    /**
     * @param {Event} e
     * @private
     */
    function validateField(e) {
      const field = e.target;
      if (!field.id || !VALIDATED_IDS.has(field.id)) return;
      setFieldError(field, getValidationMessage(field));
    }

    /**
     * @param {Event} e
     * @private
     */
    function onFieldInput(e) {
      const field = e.target;
      if (!field.id || !VALIDATED_IDS.has(field.id)) return;
      const msg = getValidationMessage(field);
      setFieldError(field, msg);
    }

    formInputs.forEach((input) => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', onFieldInput);
    });

    appointmentForm.addEventListener('submit', handleFormSubmit);

    clearAllFormErrors();

    const MAX_MAILTO_CHARS = 1800;
    const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

    /**
     * Envoi via FormSubmit (https://formsubmit.co) — aucune clé, l’e-mail de destination est dans l’URL.
     * Première utilisation : FormSubmit envoie un mail de confirmation à cette adresse (à valider une fois).
     */
    async function submitViaFormSubmit(endpointEmail, payload) {
      const url = `https://formsubmit.co/ajax/${encodeURIComponent(endpointEmail)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || res.statusText || 'Envoi refusé');
      }
      return text;
    }

    async function handleFormSubmit(e) {
      e.preventDefault();

      const { ok, firstInvalid } = validateAllForm();
      if (!ok) {
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        notify.error('Veuillez compléter ou corriger les champs indiqués dans le formulaire.');
        return;
      }

      const hp = appointmentForm.querySelector('.form__hp');
      if (hp && hp.checked) {
        notify.error('Impossible d’envoyer le message. Réessayez ou contactez-nous par téléphone.');
        return;
      }

      const givenName = $('#given-name').value.trim();
      const familyName = $('#family-name').value.trim();
      const email = $('#email').value.trim();
      const phone = $('#phone').value.trim();
      const serviceEl = $('#service');
      const serviceValue = serviceEl.value;
      const selectedOpt = serviceEl.options[serviceEl.selectedIndex];
      const serviceLabel = selectedOpt ? selectedOpt.text : serviceValue;
      const message = $('#message').value.trim();

      const subject = `[parodontia.fr] Demande RDV — ${serviceLabel}`;
      const bodyLines = [
        'Bonjour,',
        '',
        `Prénom : ${givenName}`,
        `Nom : ${familyName}`,
        `Email : ${email}`,
        `Téléphone : ${phone}`,
        `Motif : ${serviceLabel}`,
      ];
      if (message) bodyLines.push('', 'Message :', message);
      bodyLines.push('', '— Message envoyé depuis parodontia.fr');
      const bodyText = bodyLines.join('\n');

      const accessKey = (appointmentForm.getAttribute('data-web3forms-access-key') || '').trim();
      const to = appointmentForm.getAttribute('data-contact-email') || 'contact@parodontia.fr';

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';

      const trackSuccess = () => {
        notify.success('Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.');
        appointmentForm.reset();
        clearAllFormErrors();
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', { event_category: 'engagement', event_label: 'appointment_form' });
        }
      };

      const fallbackMailto = () => {
        const mailtoHref = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        if (mailtoHref.length > MAX_MAILTO_CHARS) {
          notify.warning('Message trop long pour un lien courriel. Raccourcissez ou écrivez à contact@parodontia.fr.');
          return;
        }
        notify.info(
          'Ouverture de votre messagerie avec le message prérempli… Si rien ne s’affiche, écrivez à contact@parodontia.fr.'
        );
        appointmentForm.reset();
        clearAllFormErrors();
        window.setTimeout(() => {
          window.location.href = mailtoHref;
        }, 450);
      };

      try {
        if (accessKey) {
          const res = await fetch(WEB3FORMS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: accessKey,
              subject,
              name: `${givenName} ${familyName}`.trim(),
              email,
              phone,
              message: bodyText,
              from_name: `${givenName} ${familyName}`.trim(),
              replyto: email,
              botcheck: false,
            }),
          });

          let data;
          try {
            data = await res.json();
          } catch (parseErr) {
            notify.error('Réponse du service d’envoi invalide. Réessayez dans quelques minutes.');
            return;
          }

          if (data && data.success) {
            trackSuccess();
          } else {
            const errMsg =
              (data && (data.message || (data.body && data.body.message))) ||
              'L’envoi a échoué. Réessayez plus tard ou contactez-nous par téléphone.';
            notify.error(errMsg);
          }
        } else {
          await submitViaFormSubmit(to, {
            _subject: subject,
            _replyto: email,
            _captcha: 'false',
            name: `${givenName} ${familyName}`.trim(),
            email,
            phone,
            motif: serviceLabel,
            message: bodyText,
          });
          trackSuccess();
        }
      } catch (err) {
        if (accessKey) {
          notify.error('Connexion impossible. Vérifiez votre réseau puis réessayez.');
        } else {
          notify.warning(
            'Envoi automatique indisponible. Nous ouvrons votre messagerie avec le message prérempli.'
          );
          fallbackMailto();
        }
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  }

  // ============================================================================
  // ANIMATIONS - Initialisation différée
  // ============================================================================

  /**
   * Initialise les animations d'apparition des éléments au scroll
   * Utilise IntersectionObserver pour optimiser les performances
   * @function initAnimations
   * @example
   * initAnimations();
   */
  function initAnimations() {
    if (!('IntersectionObserver' in window)) {
      const elements = $$('.traitement-card, .team-member, .contact__item, .cabinet-media-carousel');
      elements.forEach(el => {
        el.classList.add('reveal', 'is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const animatedElements = $$('.traitement-card, .team-member, .contact__item, .cabinet-media-carousel');
    animatedElements.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  // EFFETS HOVER : gérés en CSS uniquement (atomes.css, sections.css) pour de meilleures perfs.
  // Pas d'initHoverEffects en JS pour éviter des dizaines de listeners redondants.

  // ============================================================================
  // RESPONSIVE - Initialisation différée
  // ============================================================================

  /**
   * Initialise la gestion responsive du menu mobile
   * Ferme automatiquement le menu sur les écrans larges
   * @function initResponsive
   * @example
   * initResponsive();
   */
  function initResponsive() {
    const navbarToggle = $('.navbar__toggle');
    const navbarMenu = $('.navbar__menu--mobile');

    const handleResize = debounce(() => {
      if (window.innerWidth > 768) {
        if (navbarToggle && navbarMenu) {
          navbarToggle.setAttribute('aria-expanded', 'false');
          navbarMenu.classList.remove('navbar__menu--active');
          releaseMobileMenuDocListeners();
        }
      }
    }, 250);

    window.addEventListener('resize', handleResize, { passive: true });
  }

  // ============================================================================
  // ACCESSIBILITÉ - Initialisation différée
  // ============================================================================

  /**
   * Renforce les liens ouverts dans un nouvel onglet (évite l’abus window.opener).
   * Ne modifie pas mailto:/tel: (pas de nouvel onglet, rel inutile).
   * @function initAccessibility
   * @example
   * initAccessibility();
   */
  function initAccessibility() {
    $$('a[target="_blank"]').forEach((link) => {
      const rel = link.getAttribute('rel') || '';
      if (/\bnoopener\b/i.test(rel)) return;
      link.setAttribute('rel', rel ? `${rel} noopener noreferrer`.trim() : 'noopener noreferrer');
    });
  }

  // ============================================================================
  // PERFORMANCE - Initialisation différée
  // ============================================================================

  /**
   * Initialise les optimisations de performance
   * Configure le lazy loading des images
   * @function initPerformance
   * @example
   * initPerformance();
   */
  function initPerformance() {
    const lazyImages = $$('img[data-src]');
    if (lazyImages.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      lazyImages.forEach(img => {
        if (img.dataset.src) img.src = img.dataset.src;
      });
      return;
    }
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px', threshold: 0.01 });
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // ============================================================================
  // ANALYTICS - Initialisation différée
  // ============================================================================

  /**
   * Initialise le tracking Google Analytics
   * Enregistre les interactions importantes (CTA, formulaires)
   * @function initAnalytics
   * @example
   * initAnalytics();
   */
  function initAnalytics() {
    /**
     * Envoie un événement à Google Analytics
     * @param {string} category - Catégorie de l'événement
     * @param {string} action - Action effectuée
     * @param {string} label - Libellé de l'événement
     * @private
     */
    function trackEvent(category, action, label) {
      if (typeof gtag !== 'undefined') {
        gtag('event', action, {
          event_category: category,
          event_label: label
        });
      }
    }

    // Tracking des clics sur les CTA
    $$('.btn--primary').forEach(btn => {
      btn.addEventListener('click', () => {
        trackEvent('engagement', 'cta_click', btn.textContent.trim());
      });
    });

    /* Soumission formulaire : événement gtag émis dans initForm après succès API uniquement */
  }

  // ============================================================================
  // COPYRIGHT - Initialisation immédiate (critique)
  // ============================================================================

  /**
   * Met à jour l'année de copyright automatiquement
   * Fonction critique exécutée immédiatement
   * @function updateCopyright
   * @example
   * updateCopyright();
   */
  function updateCopyright() {
    const currentYear = new Date().getFullYear();
    const copyrightYearElements = $$('.copyright-year');
    copyrightYearElements.forEach(element => {
      element.textContent = currentYear;
    });
  }

  // ============================================================================
  // INITIALISATION ULTRA-OPTIMISÉE POUR PERFORMANCES
  // ============================================================================

  /**
   * Initialise les fonctionnalités critiques immédiatement
   * Ne bloque pas le rendu initial de la page
   * @function initCritical
   * @example
   * initCritical();
   */
  function initCritical() {
    // Seul le copyright est critique pour le rendu initial
    updateCopyright();

    // Sprite SVG: chargement non bloquant + injection same-origin (évite les blocages "origine").
    // Charge uniquement quand des icônes sont proches du viewport.
    (function initSvgSpriteLoader() {
      const SPRITE_URL = 'assets/Icones/icons.svg';
      const XLINK_NS = 'http://www.w3.org/1999/xlink';
      const SPRITE_ID = 'svg-sprite-runtime';
      const INLINE_SPRITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Minimal icon sprite (fill: currentColor via CSS) -->
  <defs>
  <symbol id="i-heart" viewBox="0 0 15 15">
    <path d="M4.03553 1C1.80677 1 0 2.80677 0 5.03553C0 6.10582 0.42517 7.13228 1.18198 7.88909L7.14645 13.8536C7.34171 14.0488 7.65829 14.0488 7.85355 13.8536L13.818 7.88909C14.5748 7.13228 15 6.10582 15 5.03553C15 2.80677 13.1932 1 10.9645 1C9.89418 1 8.86772 1.42517 8.11091 2.18198L7.5 2.79289L6.88909 2.18198C6.13228 1.42517 5.10582 1 4.03553 1Z" fill="currentColor"/>
  </symbol>

  <symbol id="i-award" viewBox="0 0 24 24">
    <path d="M12 2a6 6 0 0 0-3.8 10.6L6 22l6-3 6 3-2.2-9.4A6 6 0 0 0 12 2zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
  </symbol>

  <symbol id="i-comments" viewBox="0 0 24 24">
    <path d="M20 2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3v4l5-4h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
  </symbol>

  <symbol id="i-users" viewBox="0 0 24 24">
    <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3z"/>
    <path d="M16 13c-3.3 0-6 1.7-6 4v3h12v-3c0-2.3-2.7-4-6-4zM8 13c-2.8 0-5 1.4-5 3.2V20h5.2c-.1-.3-.2-.7-.2-1v-2c0-1.5.8-2.8 2-3.7A8.2 8.2 0 0 0 8 13z"/>
  </symbol>

  <symbol id="i-play" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </symbol>

  <symbol id="i-photo" viewBox="0 0 24 24">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 18C14.7614 18 17 15.7614 17 13C17 10.2386 14.7614 8 12 8C9.23858 8 7 10.2386 7 13C7 15.7614 9.23858 18 12 18ZM12 16.0071C10.3392 16.0071 8.9929 14.6608 8.9929 13C8.9929 11.3392 10.3392 9.9929 12 9.9929C13.6608 9.9929 15.0071 11.3392 15.0071 13C15.0071 14.6608 13.6608 16.0071 12 16.0071Z"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.56155 2C8.18495 2 6.985 2.93689 6.65112 4.27239L6.21922 6H4C2.34315 6 1 7.34315 1 9V19C1 20.6569 2.34315 22 4 22H20C21.6569 22 23 20.6569 23 19V9C23 7.34315 21.6569 6 20 6H17.7808L17.3489 4.27239C17.015 2.93689 15.8151 2 14.4384 2H9.56155ZM8.59141 4.75746C8.7027 4.3123 9.10268 4 9.56155 4H14.4384C14.8973 4 15.2973 4.3123 15.4086 4.75746L15.8405 6.48507C16.0631 7.37541 16.863 8 17.7808 8H20C20.5523 8 21 8.44772 21 9V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V9C3 8.44772 3.44772 8 4 8H6.21922C7.13696 8 7.93692 7.37541 8.15951 6.48507L8.59141 4.75746Z"/>
  </symbol>

  <symbol id="i-microchirurgie" viewBox="0 0 64 64">
    <g fill="none" fill-rule="evenodd">
      <path stroke="currentColor" stroke-linecap="square" stroke-width="2" d="M31,16 L31,21"/>
      <g transform="translate(18 26)">
        <path
          fill="currentColor"
          d="M7.07142857,0 C2.81094622,0 0,4.89288809 0,10.9285714 C0,16.9642548 2.81094622,36 7.07142857,36 C9.55684234,36 9.83916051,20.1920244 13.1785714,20.177711 C17.1608395,20.1920244 16.8003005,36 19.2857143,36 C23.5461966,36 26.3571429,16.9642548 26.3571429,10.9285714 C26.3571429,4.89288809 23.5461966,0 19.2857143,0 C17.25,0 15.2142857,1.92857143 13.1785714,1.92857143 C11.1428571,1.92857143 9.10714286,0 7.07142857,0 Z"
        />
        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8.17857143,3 C5.41714768,3 3.17857143,5.23857625 3.17857143,8"/>
      </g>
      <path
        fill="currentColor"
        d="M25,1 L37,1 L37,10.0069348 C37,13.3168133 34.3069658,16 31,16 L31,16 C27.6862915,16 25,13.3183006 25,10.0069348 L25,1 Z"
      />
      <path stroke="currentColor" stroke-linecap="square" stroke-width="2" d="M26,8 L31,8"/>
      <circle cx="31" cy="22" r="2" fill="currentColor"/>
      <rect width="27" height="4" x="37" y="4" fill="currentColor"/>
    </g>
  </symbol>

  <symbol id="i-piezochirurgie" viewBox="0 0 64 64">
    <g fill="none" fill-rule="evenodd" transform="rotate(45 23.036 68.299)">
      <rect width="6" height="38" y="18" fill="currentColor"/>
      <polygon fill="currentColor" opacity="0.65" points="2 7 4 7 6 18 0 18"/>
      <polygon
        fill="currentColor"
        opacity="0.65"
        points="2 56 4 56 6 67 0 67"
        transform="matrix(1 0 0 -1 0 123)"
      />
      <polygon fill="currentColor" opacity="0.35" points="0 0 6 0 4 7 2 7"/>
      <polygon
        fill="currentColor"
        opacity="0.35"
        points="0 67 6 67 4 74 2 74"
        transform="matrix(1 0 0 -1 0 141)"
      />
    </g>
  </symbol>

  <symbol id="i-technologie" viewBox="-6.4 -6.4 76.8 76.8">
    <g fill="none" fill-rule="evenodd">
      <polyline
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="2"
        opacity="0.65"
        points="28.986 32.695 28.986 10 23 10"
      />
      <path stroke="currentColor" stroke-linecap="square" stroke-width="2" opacity="0.65" d="M30,24 L34,24"/>
      <circle cx="19" cy="10" r="5" fill="currentColor"/>
      <path
        fill="currentColor"
        fill-rule="nonzero"
        d="M55.1101377,47.7175322 C56.0889464,48.2293987 57.2973774,47.8508672 57.8092438,46.8720585 C58.3211103,45.8932498 57.9425788,44.6848188 56.9637701,44.1729523 L33.4855051,32.039344 L20.9705334,32.039344 L9.78869638,15.8283084 C9.15693144,14.9222473 7.91027706,14.6998863 7.00421589,15.3316512 C6.09815473,15.9634162 5.87579372,17.2100705 6.50755867,18.1161317 L18.985921,36.0222833 L32.6054267,36.0222833 L55.1101377,47.7175322 Z"
      />
      <rect width="10" height="6" x="34" y="21" fill="currentColor"/>
      <path stroke="currentColor" stroke-linecap="square" stroke-width="2" opacity="0.65" d="M37 24L37 29M41 24L41 29"/>
      <polygon fill="currentColor" opacity="0.65" points="19 36 31 36 27.057 40.011 31 46 24 46"/>
      <polygon fill="currentColor" points="19 46 31 46 31 53 10 53"/>
      <path stroke="currentColor" stroke-linecap="square" stroke-width="2" opacity="0.65" d="M2,54 L61.008474,54"/>
    </g>
  </symbol>

  <symbol id="i-hygiene" viewBox="0 0 298 240">
    <g
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="8"
    >
      <path d="M164 173.5C178.453552 172.270493 189.312851 165.447937 195.94101 152.469864C198.431625 147.59317 200.649307 142.478149 201.452194 136.992996C202.339752 130.92952 198.993546 125.629471 196.725479 120.624405C192.124527 110.47123 184.422394 103.004753 173.016251 99.939529C155.594772 95.257767 139.571869 101.341942 130.609894 116.066879C118.892471 135.319107 125.579872 157.038818 143.049362 167.920746C148.109451 171.072739 153.735672 173.324905 160.00148 173.03154C161.157806 172.977402 162.333328 173.333344 163.5 173.500015"/>
      <path d="M108 79C103.5 75 99.103767 70.874237 94.462799 67.045082C91.46669 64.573051 87.779549 63.047333 84.411736 61.157269C79.658203 58.489529 73.432541 62.658661 72.525444 68.503952C72.348656 69.643181 72.5 70.833336 72.5 72C72.5 114.666664 72.560829 157.333542 72.415398 199.99971C72.39904 204.79834 74.211533 208.741516 78.107277 210.216705C81.221191 211.395859 84.989761 210.447632 88.64164 208.233627C95.281487 204.208115 100.567604 198.75119 106.457016 193.947296C107.343575 193.224136 107.94223 193.183548 109.000282 193.18837C143.499939 193.346359 177.999985 193.423294 212.500015 193.496231C223.833282 193.520187 235.166702 193.513672 246.499985 193.493698C251.473618 193.48494 252.121948 193.049347 251.94101 188.002121C251.666122 180.334625 252.893646 172.639465 251.133011 164.969467C250.604416 162.666794 252.062347 160.099091 252.052689 157.499802C251.963379 133.500137 252.001892 109.5 251.998734 85.5C251.997864 78.846626 251.584763 78.043495 245.000641 78.090279C236.001495 78.154198 226.961517 77.145088 217.983383 78.915764C215.929474 79.320839 213.666809 78.523666 211.499985 78.5215C180.166687 78.490112 148.833328 78.499992 117.5 78.5C107.499992 78.5 107.5 78.500008 107.5 88.5C107.5 121.5 107.488274 154.500015 107.534454 187.499954C107.536766 189.156647 106.941299 190.922531 108 192.5"/>
      <path d="M88.5 65C87.282631 67.356529 86.965187 69.850334 86.968193 72.500038C87.013947 112.833321 86.965675 153.166748 87.047935 193.499908C87.057144 198.015762 86.095909 202.711563 88.5 207"/>
      <path d="M217.5 80C217.5 106 217.5 132 217.5 158C217.5 167.666672 217.51268 177.333359 217.487915 186.999969C217.483612 188.674561 217.80127 190.39679 217 192"/>
      <path d="M184.5 136C170.33728 135.244446 156.169617 135.331192 142 135.75"/>
      <path d="M183.5 124.5C169.666672 124.416664 155.833328 124.333336 142 124.25"/>
      <path d="M183 147.25C169.333328 147.662796 155.666672 147.662796 142 147.25"/>
      <path d="M219 164.5C229.333328 164.5 239.666672 164.5 250 164.5"/>
      <path d="M242.5 107C237.546188 105.447838 232.45401 108.046463 227.5 106.5"/>
      <path d="M241.5 95.5C236.833328 95.5 232.166672 95.5 227.5 95.5"/>
    </g>
  </symbol>

  <symbol id="i-cbct3d" viewBox="0 0 864 848">
    <path d="M66.546257,524.318359 C60.333744,493.914948 57.785053,463.583527 59.086403,433.032776 C61.989071,364.889038 81.198723,301.739990 118.076416,244.160950 C152.071106,191.083282 196.690918,149.158020 251.281052,117.844360 C277.228485,102.960556 304.761688,91.584747 333.531433,83.478653 C357.412292,76.750031 381.779968,72.394661 406.595276,70.631737 C428.410156,69.081970 450.233002,68.939384 471.970490,70.959343 C497.191223,73.302971 522.009338,78.049179 546.318970,85.433357 C582.762024,96.503136 616.833557,112.489113 648.356567,133.838303 C700.222961,168.965271 741.118591,214.113831 770.782166,269.266174 C790.002625,305.002167 802.995911,343.013367 809.938721,382.998901 C815.897156,417.315521 816.754333,451.860138 813.388855,486.511658 C810.300598,518.308289 803.414429,549.298767 792.100098,579.148560 C775.058960,624.107239 750.750244,664.692200 718.438293,700.536926 C687.395874,734.973145 651.370972,762.735840 610.291809,784.013000 C574.078125,802.770142 535.851624,815.442749 495.459442,821.511597 C454.793488,827.621643 414.217529,827.530823 373.650269,820.568481 C306.129120,808.980286 246.148575,781.229309 193.647720,737.203308 C153.780930,703.771912 122.229195,663.769409 98.870110,617.349487 C84.443436,588.680420 73.543427,558.708191 67.319031,527.135010 C67.158241,526.319458 66.880417,525.526855 66.546257,524.318359 Z M736.933228,598.532166 C750.280823,572.274170 759.706604,544.659607 765.731140,515.842102 C769.554321,497.554382 772.023254,479.097626 772.637268,460.435669 C773.251282,441.774597 772.404297,423.194763 769.955872,404.622711 C766.985413,382.090088 762.066833,360.080078 754.714905,338.614563 C744.177673,307.848907 729.366150,279.283783 710.427124,252.817856 C679.025269,208.935959 639.505432,174.423859 591.638550,149.542206 C557.508972,131.801315 521.422729,120.258789 483.241882,114.949402 C449.966797,110.322212 416.862122,110.770294 383.740326,115.927818 C351.239746,120.988602 320.284180,130.976486 290.747437,145.341980 C242.414124,168.849365 201.835571,201.939346 169.367554,244.779404 C146.247864,275.284729 128.770401,308.786987 116.990669,345.274933 C108.560669,371.387024 103.123009,398.118683 101.578636,425.430542 C99.787621,457.104340 101.835823,488.582245 108.905609,519.720154 C117.053246,555.605408 130.033508,589.516174 149.232086,620.830872 C188.134186,684.283875 241.920380,730.589478 310.924042,758.881714 C347.317841,773.803467 385.189453,781.739319 424.550934,783.028198 C460.626892,784.209412 496.018951,780.223572 530.639526,770.120422 C557.433594,762.301147 582.913269,751.327209 606.985046,737.070251 C663.504700,703.595459 706.530701,657.501526 736.933228,598.532166 Z" fill="currentColor"/>
    <path d="M297.237549,721.862061 C285.804291,715.946167 275.129669,709.497437 264.677032,702.637756 C261.088196,700.282532 261.026215,698.438721 263.378784,695.109070 C283.841064,666.148560 304.143677,637.075378 324.528442,608.060059 C345.391785,578.363586 366.305664,548.702637 387.170471,519.007141 C391.530090,512.802307 391.440277,512.829163 397.920197,516.378967 C424.681671,531.039062 451.340088,530.824890 477.672150,515.378113 C481.152283,513.336670 482.986359,513.421509 485.333893,516.782959 C505.920654,546.261169 526.641907,575.645386 547.320496,605.059509 C567.520203,633.792480 587.766418,662.492981 607.886719,691.281311 C614.771057,701.131592 614.594482,698.999512 605.321594,705.191345 C580.795471,721.568054 554.334961,733.952148 526.114075,742.467041 C505.837372,748.584961 485.112030,752.427246 463.977112,754.235962 C413.948853,758.517273 365.759613,751.253113 319.349823,732.016968 C311.955048,728.951904 304.759247,725.513123 297.237549,721.862061 Z" fill="currentColor"/>
    <path d="M602.567749,191.414978 C634.122314,211.510315 660.685181,236.468750 682.850769,266.094086 C702.041382,291.743378 716.783875,319.803772 727.014282,350.151733 C735.329651,374.818756 740.929504,400.050385 742.425781,426.167999 C743.294373,441.330444 743.521179,456.428375 742.433960,471.576965 C742.169312,475.263855 740.944336,476.684021 737.320190,476.347473 C724.563110,475.162933 711.798279,474.062836 699.037354,472.919098 C678.320679,471.062347 657.604553,469.200378 636.888794,467.333496 C612.692871,465.153015 588.499451,462.943512 564.301270,460.788086 C549.721924,459.489502 535.146606,458.108704 520.545776,457.110779 C516.023987,456.801727 514.670532,455.190643 514.701111,450.700623 C514.909607,420.082001 501.301910,397.171539 475.332489,381.352264 C469.533264,377.819702 469.419098,377.798981 472.386414,371.385834 C484.270142,345.701904 496.226166,320.051422 508.144928,294.383667 C520.126709,268.580200 532.070007,242.758865 544.080994,216.969009 C550.546021,203.087280 557.146667,189.268692 563.617004,175.389359 C564.927856,172.577469 566.352234,171.006775 569.705933,172.754257 C580.779541,178.524460 591.906860,184.188477 602.567749,191.414978 Z" fill="currentColor"/>
    <path d="M385.474976,390.468323 C367.891327,406.908936 358.576080,426.636597 359.308868,450.584747 C359.458313,455.468903 357.624115,456.726257 353.042542,457.109406 C320.200989,459.855896 287.385773,462.915222 254.555786,465.802460 C222.724945,468.601837 190.885208,471.300018 159.052277,474.075958 C151.756561,474.712128 144.467346,475.434479 137.185638,476.215210 C133.439407,476.616821 131.896164,475.330627 131.612961,471.326874 C129.532089,441.909027 131.447708,412.778625 137.661652,383.965485 C146.661392,342.234985 163.589737,304.021515 188.664886,269.404694 C218.683899,227.962753 256.853088,196.309631 302.587250,173.547028 C306.869904,171.415482 308.910400,171.913437 310.931793,176.331772 C323.050903,202.821121 335.379944,229.214539 347.665771,255.627487 C358.053192,277.959137 368.490204,300.267731 378.881134,322.597748 C386.816742,339.651398 394.675873,356.740814 402.665619,373.768982 C404.068054,376.757996 403.705719,378.632172 400.620178,380.200745 C395.263947,382.923492 390.322906,386.330688 385.474976,390.468323 Z" fill="currentColor"/>
    <path d="M471.428955,423.656860 C491.083069,452.716309 473.342346,489.346039 438.662750,492.039612 C416.664948,493.748169 395.637207,473.998047 394.466766,452.015228 C393.163452,427.537292 410.618896,407.921417 434.749664,406.272736 C449.689026,405.252045 461.856079,411.698578 471.428955,423.656860 Z" fill="currentColor"/>
  </symbol>

  <symbol id="i-extraction" viewBox="0 0 24 24">
    <g transform="translate(0,24) scale(0.0022222,-0.0022222)" fill="currentColor" stroke="none">
      <path d="M5103 8081 c-184 -46 -355 -160 -483 -321 -224 -282 -327 -552 -429 -1120 -81 -455 -128 -1042 -118 -1470 10 -396 61 -619 176 -777 39 -54 99 -85 162 -85 61 1 99 21 173 91 103 97 186 241 394 681 70 148 193 369 264 473 106 155 219 248 304 250 48 1 110 -31 138 -72 86 -125 96 -328 41 -871 -32 -319 -40 -485 -27 -600 23 -203 68 -293 160 -321 37 -11 50 -10 97 5 147 46 355 249 529 515 188 288 435 728 571 1016 206 437 298 685 374 1005 110 462 34 854 -210 1085 -86 82 -146 118 -259 155 -87 29 -107 31 -230 32 -97 1 -166 -5 -245 -20 -317 -59 -400 -35 -715 210 -75 57 -178 110 -265 134 -92 25 -311 28 -402 5z m329 -281 c28 -10 59 -27 69 -36 25 -23 25 -78 0 -103 -18 -18 -30 -19 -134 -14 -98 5 -124 3 -184 -15 -144 -44 -254 -144 -329 -299 -62 -128 -106 -154 -158 -92 -65 77 -3 263 133 400 105 105 216 156 396 183 53 7 155 -4 207 -24z"/>
      <path d="M2470 4540 c-58 -9 -127 -23 -153 -30 -47 -12 -48 -13 -41 -44 35 -162 193 -519 335 -758 352 -589 862 -1043 1479 -1313 452 -198 1043 -306 1512 -275 595 38 1135 220 1618 543 554 371 1009 930 1248 1532 49 123 102 294 93 299 -3 2 -37 11 -76 19 -285 64 -671 64 -950 0 -382 -86 -643 -208 -1145 -533 -282 -182 -424 -257 -594 -314 -311 -105 -608 -84 -946 64 -123 54 -415 223 -560 325 -154 108 -441 251 -695 347 -75 28 -221 71 -360 104 -223 55 -555 69 -765 34z m1323 -861 c12 -7 70 -62 129 -123 l107 -111 113 112 c66 64 125 114 141 118 82 21 157 -85 114 -162 -7 -13 -48 -60 -92 -105 -44 -46 -89 -93 -99 -105 l-19 -23 97 -101 c100 -104 116 -129 116 -181 0 -42 -57 -98 -99 -98 -50 0 -82 23 -180 127 l-92 97 -107 -106 c-115 -115 -145 -134 -189 -117 -62 23 -94 83 -79 145 4 14 52 73 106 130 55 58 100 110 100 115 0 6 -43 57 -96 112 -53 56 -103 118 -111 137 -38 88 57 182 140 139z m1480 -320 c12 -6 70 -59 129 -117 l108 -106 107 106 c122 119 148 132 210 101 47 -22 65 -56 59 -107 -4 -33 -20 -54 -111 -147 l-108 -109 91 -97 c49 -54 102 -109 116 -122 54 -51 38 -143 -31 -176 -64 -31 -88 -17 -216 115 l-115 119 -124 -124 c-112 -113 -127 -125 -159 -125 -77 0 -133 72 -115 146 5 18 52 74 122 145 l115 116 -103 108 c-57 59 -108 117 -115 129 -48 83 54 189 140 145z"/>
    </g>
  </symbol>

  <symbol id="i-parodontologie" viewBox="0 0 626 825">
    <g fill="currentColor" fill-rule="nonzero">
      <path d="m208.51 306.65 354.82 357.48c7.35 7.41 7.32 19.39-.09 26.76-3.7 3.68-8.55 5.51-13.38 5.49-4.84-.01-9.68-1.88-13.35-5.58L181.69 333.33q-.89-.9-1.63-1.89c-3.48-4.54-4.61-10.31-3.38-15.66.76-3.38 2.46-6.59 5.1-9.21 3.7-3.68 8.55-5.52 13.38-5.49 3.74 0 7.47 1.12 10.67 3.34q1.42.97 2.68 2.23"/>
      <path d="m223.24 321.49-4.11-4.14-26.82 26.67 4.11 4.14z"/>
      <path d="m201.56 353.34 11.78 11.88 26.82-26.68-11.78-11.87z"/>
      <path d="m206.06 304.18-.23.24-20.68 21.68-5.09 5.34-.12.12-48.46-70.55-1.96-2.85.34-.39.14-.16 4.11-4.72 2.98 2.13z"/>
      <path opacity=".4" d="M554.83 668.04c1.43 1.44 1.4 3.78-.06 5.24-1.46 1.45-3.81 1.46-5.23.03L200.27 321.42c-1.43-1.43-1.4-3.78.06-5.23 1.47-1.46 3.81-1.47 5.23-.03z"/>
      <path d="m77.05 194.53 82.39 83.01-5.81 5.78-82.4-83.01z"/>
      <path d="M56.99 104.44c1.54 18.21-3.03 71.41-.25 77.78 3.25 7.44 12.99 9.6 20.31 12.31.2 2.39.1 5.23-.6 7.7q-.31 1.13-.8 2.12-.01 0-.59-.19c-3.53-1.16-21.96-7.47-26.52-14.45q-.09-.13-.17-.28c-5.37-9.61 2-67.63 8.62-84.99"/>
      <path opacity=".5" d="m470.3 570.41 93.03 93.72c7.35 7.41 7.32 19.39-.09 26.76-3.7 3.68-8.55 5.51-13.38 5.49-4.84-.01-9.68-1.88-13.35-5.58L181.69 333.33q-.89-.9-1.63-1.89l-.12.12-48.46-70.55-56.42-56.85c-3.53-1.16-21.96-7.47-26.52-14.45q-.09-.13-.17-.28c5.67 3.33 12.98 5.75 22.01 9.6q.74.32 1.48.66c1.55.74 3.36 1.25 4.59 2.54 13.46 14.14 46.68 44.78 60.22 58.42 1.89 1.91 28.19 40.42 40.01 55.13q4.15 5.19 8.47 10.32c8.62 10.24 215.45 218.13 258.69 240.65 12.01 6.26 20.43 6.77 26.46 3.66"/>
    </g>
  </symbol>

  <symbol id="i-implant" viewBox="0 0 64 64">
    <g fill="none" fill-rule="evenodd">
      <path fill="currentColor" d="M51.8137386,32 C52.5838535,26.7174939 53,21.8964501 53,19 C53,9.61115925 48.627417,2 42,2 C38.8333333,2 35.6666667,5 32.5,5 C29.3333333,5 26.1666667,2 23,2 C16.372583,2 12,9.61115925 12,19 C12,21.8964501 12.4161465,26.7174939 13.1862614,32 L51.8137386,32 L51.8137386,32 Z"/>
      <polygon fill="currentColor" points="24 32 41 32 41 39 38 43 38 58 32.5 62 27 58 27 43 24 39"/>
      <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M25,6 C20.581722,6 17,9.581722 17,14"/>
      <polygon fill="grey" points="27 51 38 54 38 56 27 53"/>
      <polygon fill="grey" points="27 47 38 50 38 52 27 49"/>
      <polygon fill="grey" points="27 43 38 46 38 48 27 45"/>
    </g>
  </symbol>

  <symbol id="i-phone" viewBox="0 0 512 512">
    <path d="M130.344,129.778c-27.425,17.786-32.812,73.384-22.459,118.698c8.064,35.288,25.208,82.623,54.117,127.198c27.196,41.933,65.138,79.532,94.069,101.286c37.151,27.934,90.112,45.688,117.537,27.902c13.868-8.994,34.47-33.567,35.41-37.976c0,0-12.082-18.629-14.733-22.716l-40.516-62.47c-3.011-4.642-21.892-0.399-31.484,5.034c-12.938,7.331-24.854,27.001-24.854,27.001c-8.872,5.125-16.302,0.019-31.828-7.126c-19.081-8.779-40.535-36.058-57.609-60.765c-15.595-25.666-31.753-56.38-31.988-77.382c-0.192-17.09-1.824-25.957,6.473-31.967c0,0,22.82-2.858,34.79-11.681c8.872-6.542,20.447-22.051,17.436-26.693l-40.515-62.47c-2.651-4.088-14.733-22.716-14.733-22.716C175.05,111.994,144.211,120.784,130.344,129.778z" stroke-width="2"/>
    <path d="M360.036,176.391c16.488-67.201-22.687-135.921-88.913-155.97L276.715,0c77.488,23.14,123.308,103.517,103.742,181.983L360.036,176.391z" stroke-width="2"/>
    <path d="M315.781,164.273c9.845-42.802-14.93-86.262-56.776-99.596l5.594-20.428c53.106,16.435,84.524,71.548,71.61,125.618L315.781,164.273z" stroke-width="2"/>
    <path d="M271.466,152.138c3.288-18.373-7.111-36.616-24.596-43.147l5.605-20.468c28.724,9.694,45.751,39.564,39.459,69.22L271.466,152.138z" stroke-width="2"/>
  </symbol>

  <symbol id="i-envelope" viewBox="0 0 24 24">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5L4 8V6l8 5 8-5z"/>
  </symbol>

  <symbol id="i-clock" viewBox="0 0 24 24">
    <path d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"/>
    <path d="M12 5C11.4477 5 11 5.44771 11 6V12.4667C11 12.4667 11 12.7274 11.1267 12.9235C11.2115 13.0898 11.3437 13.2343 11.5174 13.3346L16.1372 16.0019C16.6155 16.278 17.2271 16.1141 17.5032 15.6358C17.7793 15.1575 17.6155 14.5459 17.1372 14.2698L13 11.8812V6C13 5.44772 12.5523 5 12 5Z"/>
  </symbol>

  <symbol id="i-pin" viewBox="0 0 24 24">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5z"/>
  </symbol>

  <symbol id="i-car" viewBox="0 0 24 24">
    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11v8h-2v-2H7v2H5v-8zm3.1-4L7 10h10l-1.1-3zM8 16a1.5 1.5 0 1 0-1.5-1.5A1.5 1.5 0 0 0 8 16zm8 0a1.5 1.5 0 1 0-1.5-1.5A1.5 1.5 0 0 0 16 16z"/>
  </symbol>

  <symbol id="i-calendar-check" viewBox="0 0 640 640">
    <path d="M424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64zM160 176C151.2 176 144 183.2 144 192L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 192C496 183.2 488.8 176 480 176L160 176zM390.7 241.9C398.5 231.2 413.5 228.8 424.2 236.6C434.9 244.4 437.3 259.4 429.5 270.1L307.4 438.1C303.3 443.8 296.9 447.4 289.9 447.9C282.9 448.4 276 445.9 271.1 441L215.2 385.1C205.8 375.7 205.8 360.5 215.2 351.2C224.6 341.9 239.8 341.8 249.1 351.2L285.1 387.2L390.7 242z"/>
  </symbol>

  <symbol id="i-calendar-plus" viewBox="0 0 24 24">
    <path
      d="M3 9H21M12 18V12M15 15.001L9 15M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </symbol>

  <symbol id="i-calendar-check-alt" viewBox="0 0 24 24">
    <path
      d="M3 9H21M12 18V12M15 15.001L9 15M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </symbol>

  <symbol id="i-info" viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </symbol>

  <symbol id="i-home" viewBox="0 0 24 24">
    <path d="M12 3 2 11h3v10h6v-6h2v6h6V11h3z"/>
  </symbol>

  <symbol id="i-user-md" viewBox="0 0 24 24">
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"/>
    <path d="M4 22v-2c0-3.3 3.6-6 8-6s8 2.7 8 6v2h-6v-3h-2v3H4z"/>
    <path d="M19 7h-1V6h-2v1h-1v2h1v1h2V9h1z"/>
  </symbol>

  <symbol id="i-arrow-left" viewBox="0 0 24 24">
    <path d="M14 6 8 12l6 6 1.4-1.4L10.8 12l4.6-4.6z"/>
  </symbol>

  <symbol id="i-arrow-up" viewBox="0 0 24 24">
    <path d="M12 4l-7 7 1.4 1.4L11 7.8V20h2V7.8l4.6 4.6L19 11z"/>
  </symbol>

  <symbol id="i-x" viewBox="0 0 24 24">
    <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/>
  </symbol>

  <symbol id="i-check-circle" viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1.1 14.2L6.8 12l1.4-1.4 2.7 2.7 5.9-5.9 1.4 1.4z"/>
  </symbol>

  <symbol id="i-alert-circle" viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </symbol>

  <symbol id="i-alert-triangle" viewBox="0 0 24 24">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </symbol>

  <symbol id="i-instagram" viewBox="0 0 24 24">
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4a4 4 0 1 1-4 4 4 4 0 0 1 4-4zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm5.2-2.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
  </symbol>
  </defs>
</svg>`;

      let started = false;

      function hasExternalSpriteUse() {
        // GitHub Pages = FS sensible à la casse : le dépôt utilise `assets/Icones/`.
        // Accepter aussi `icones` pour ne pas désactiver tout le chargeur si une page a la mauvaise casse.
        return document.querySelector(
          'svg use[href*="assets/Icones/icons.svg#"], svg use[href*="assets/icones/icons.svg#"], svg use[xlink\\:href*="assets/Icones/icons.svg#"], svg use[xlink\\:href*="assets/icones/icons.svg#"]'
        );
      }

      function normalizeUseToLocalSymbols() {
        document
          .querySelectorAll('svg use[href], svg use[xlink\\:href]')
          .forEach((u) => {
            const raw = u.getAttribute('href') || u.getAttribute('xlink:href');
            if (!raw) return;
            const m = raw.match(/(?:^|\/)assets\/[Ii]cones\/icons\.svg#(.+)$/);
            if (!m) return;
            const local = `#${m[1]}`;
            u.setAttribute('href', local);
            u.setAttributeNS(XLINK_NS, 'xlink:href', local);
          });
      }

      async function injectSprite() {
        if (document.getElementById(SPRITE_ID)) {
          normalizeUseToLocalSymbols();
          return;
        }
        let text = '';
        // En file:// ou si CORS bloque, fetch peut échouer → fallback inline.
        if (location.protocol !== 'file:') {
          try {
            const res = await fetch(SPRITE_URL, { cache: 'force-cache' });
            if (!res.ok) throw new Error(`sprite fetch failed (${res.status})`);
            text = await res.text();
          } catch (e) {
            text = INLINE_SPRITE_SVG;
          }
        } else {
          text = INLINE_SPRITE_SVG;
        }

        const wrap = document.createElement('div');
        wrap.innerHTML = text.trim();
        const svg = wrap.querySelector('svg');
        if (!svg) throw new Error('sprite svg missing');

        svg.id = SPRITE_ID;
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.style.overflow = 'hidden';
        svg.style.pointerEvents = 'none';
        svg.style.left = '-9999px';
        svg.style.top = '-9999px';

        document.body.insertAdjacentElement('afterbegin', svg);
        normalizeUseToLocalSymbols();
      }

      function start() {
        if (started) return;
        started = true;
        // Non bloquant: on lance après le rendu
        Promise.resolve()
          .then(() => injectSprite())
          .catch(() => {
            // fallback: au moins duplique href -> xlink:href pour compat
            try {
              document.querySelectorAll('svg use[href]').forEach((u) => {
                const href = u.getAttribute('href');
                if (!href) return;
                if (u.getAttribute('xlink:href')) return;
                u.setAttributeNS(XLINK_NS, 'xlink:href', href);
              });
            } catch (e) {}
          });
      }

      // Si aucune icône n'utilise le sprite, ne rien faire.
      if (!hasExternalSpriteUse()) return;

      // Cas file:// (Chrome) : les <use> externes sont bloqués "origine" quoi qu'il arrive.
      // On injecte immédiatement le sprite inline et on rebascule les <use> en #id.
      if (location.protocol === 'file:') {
        // On tente dès que possible (script defer ⇒ DOM déjà parsé)
        start();
        return;
      }

      if ('IntersectionObserver' in window) {
        // Charge quand on approche une icône qui utilise le sprite.
        const firstUse = hasExternalSpriteUse();
        if (!firstUse) return;
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              io.disconnect();
              start();
            }
          },
          { rootMargin: '400px 0px' }
        );
        io.observe(firstUse);
      } else {
        // Fallback vieux navigateurs
        if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 1500 });
        else setTimeout(start, 200);
      }
    })();

    // Amélioration du LCP - rendre visible le titre hero immédiatement
    const heroTitle = $('#hero-title');
    if (heroTitle) {
      heroTitle.classList.add('is-visible');
    }
  }

  /**
   * UI interactive (navigation, formulaire, accessibilité) — exécution immédiate dès le DOM prêt.
   * Ne pas retarder via load / requestIdleCallback : sinon le formulaire reste sans écouteurs (pas de validation, pas de toast).
   * @function initInteractiveUI
   */
  function initInteractiveUI() {
    initNavigation();
    initSmoothScroll();
    initForm();
    initResponsive();
    initAccessibility();
  }

  /**
   * Animations, perfs, analytics, bouton retour haut — peut rester différé.
   * @function initDeferredEnhancements
   */
  function initDeferredEnhancements() {
    defer(() => {
      initAnimations();
      initPerformance();
      initAnalytics();
    });

    defer(() => {
      const sidebarScrollBtn = $('.sidebar__action[aria-label="Retour en haut"]');
      if (sidebarScrollBtn) {
        sidebarScrollBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const start = window.scrollY || window.pageYOffset;
          const duration = 400;
          const startTime = performance.now();

          const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

          /**
           * Animation de scroll fluide vers le haut
           * @param {number} now - Timestamp actuel
           * @private
           */
          function scrollStep(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            window.scrollTo(0, start * (1 - eased));
            if (progress < 1) {
              requestAnimationFrame(scrollStep);
            }
          }
          requestAnimationFrame(scrollStep);
        });
      }
    });
  }

  /**
   * Point d'entrée principal de l'application
   * Initialise les fonctionnalités critiques puis les non-critiques
   * @function startApp
   * @example
   * startApp();
   */
  function startApp() {
    initCritical();
    initInteractiveUI();
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        initDeferredEnhancements();
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        initDeferredEnhancements();
      }, 100);
    }
  }

  /**
   * Vidéo hero : MP4 H.264 (OK iPhone + Android), jamais dans le chemin critique.
   * On attend la fin du chargement document (`load`) puis une fenêtre idle pour ne pas
   * concurrencer LCP / images ; poster + preload=none gardent le premier rendu léger.
   */
  function initHeroVideoDeferred() {
    const video = $('.hero__video[data-hero-src]');
    if (!video) return;
    const src = video.getAttribute('data-hero-src');
    if (!src) return;

    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    } catch {}
    try {
      if (navigator.connection && navigator.connection.saveData) return;
      if (navigator.connection && typeof navigator.connection.effectiveType === 'string') {
        const t = navigator.connection.effectiveType;
        if (t === 'slow-2g' || t === '2g') return;
      }
    } catch {}

    if (video.querySelector('source')) return;

    const start = () => {
      const source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);
      try {
        video.load();
      } catch (_) {}
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    };

    const runAfterQuiet = () => {
      if (window.requestIdleCallback) {
        requestIdleCallback(start, { timeout: 4000 });
      } else {
        setTimeout(start, 900);
      }
    };

    // Après `load` : le navigateur a fini les ressources synchrones du document (meilleur pour perf / LCP).
    if (document.readyState === 'complete') {
      runAfterQuiet();
    } else {
      window.addEventListener('load', runAfterQuiet, { once: true });
    }
  }

  /**
   * Manifest : éviter de l'ajouter au chemin critique (Lighthouse).
   * On l'injecte après le rendu / idle.
   */
  function runDeferredHeadWork() {
    initHeroVideoDeferred();
  }

  function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    };
    if (window.requestIdleCallback) {
      requestIdleCallback(register, { timeout: 8000 });
    } else {
      setTimeout(register, 2500);
    }
  }

  function initDeferredGoogleMap() {
    const holder = document.querySelector('[data-map-consent][data-map-src]');
    if (!holder) return;

    const btn = holder.querySelector('.map__activate');
    if (!btn) return;

    const src = holder.getAttribute('data-map-src');
    if (!src) return;

    const loadMap = () => {
      if (holder.getAttribute('data-map-loaded') === 'true') return;
      holder.setAttribute('data-map-loaded', 'true');

      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.width = '100%';
      iframe.height = '400';
      iframe.className = 'map__iframe';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.title = 'Carte : 40 Avenue de la Division Leclerc, 92290 Châtenay-Malabry';
      iframe.setAttribute(
        'aria-label',
        'Carte Google Maps centrée sur 40 Avenue de la Division Leclerc, 92290 Châtenay-Malabry'
      );

      holder.replaceWith(iframe);
    };

    btn.addEventListener('click', loadMap, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDeferredHeadWork);
  } else {
    runDeferredHeadWork();
  }

  /* Dès le DOM prêt (script en defer : souvent déjà « interactive » ici). Ne pas attendre window « load » :
   * le formulaire doit être initialisé tout de suite, sans quoi soumission / validation / toasts ne fonctionnent pas. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }

  // SW : enregistre après l'initialisation (sans bloquer le rendu).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceWorker);
  } else {
    initServiceWorker();
  }

  // Carte Google Maps : chargement uniquement après action utilisateur.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeferredGoogleMap);
  } else {
    initDeferredGoogleMap();
  }

})();
