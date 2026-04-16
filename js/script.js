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

    function iconFor(kind) {
      if (kind === 'success') return 'fa-check-circle';
      if (kind === 'error') return 'fa-exclamation-circle';
      if (kind === 'warning') return 'fa-exclamation-triangle';
      return 'fa-info-circle';
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

      const icon = document.createElement('i');
      icon.className = `fas ${iconFor(kind)} toast__icon`;
      icon.setAttribute('aria-hidden', 'true');

      const text = document.createElement('p');
      text.className = 'toast__text';
      text.textContent = message;

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'toast__close';
      closeBtn.setAttribute('aria-label', 'Fermer la notification');
      const xi = document.createElement('i');
      xi.className = 'fas fa-times';
      xi.setAttribute('aria-hidden', 'true');
      closeBtn.appendChild(xi);

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
          navbar.style.background = 'rgba(255, 255, 255, 0.98)';
          navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
          navbar.style.background = 'rgba(255, 255, 255, 0.95)';
          navbar.style.boxShadow = 'none';
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
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        observer.unobserve(el);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const animatedElements = $$('.traitement-card, .team-member, .contact__item, .cabinet-media-carousel');
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
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

    // Amélioration du LCP - rendre visible le titre hero immédiatement
    const heroTitle = $('#hero-title');
    if (heroTitle) {
      heroTitle.style.opacity = '1';
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
   * Vidéo hero : pas de téléchargement MP4 tant que le DOM est prêt (réduit la charge initiale).
   */
  function initHeroVideoDeferred() {
    const video = $('.hero__video[data-hero-src]');
    if (!video) return;
    const src = video.getAttribute('data-hero-src');
    if (!src) return;
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.setAttribute('autoplay', '');
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  function runDeferredHeadWork() {
    initHeroVideoDeferred();
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

})();
