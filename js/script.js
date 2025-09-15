/**
 * Cabinet DR Raphaël BROCHAND - JavaScript ultra-optimisé
 * Optimisé pour les performances critiques (FCP/LCP)
 */

(function() {
  'use strict';

  // ============================================================================
  // UTILITAIRES LÉGERS
  // ============================================================================

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // Debounce optimisé
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Fonction pour reporter l'exécution après le rendu critique
  function defer(fn) {
    if (window.requestIdleCallback) {
      requestIdleCallback(fn, { timeout: 100 });
    } else {
      setTimeout(fn, 1);
    }
  }

  // ============================================================================
  // NAVIGATION - Initialisation différée
  // ============================================================================

  function initNavigation() {
    const navbar = $('.navbar');
    const navbarToggle = $('.navbar__toggle');
    const navbarMenu = $('.navbar__menu--mobile');
    const navbarLinks = $$('.navbar__link');

    // Toggle menu mobile
    if (navbarToggle && navbarMenu) {
      navbarToggle.addEventListener('click', () => {
        const isExpanded = navbarToggle.getAttribute('aria-expanded') === 'true';
        navbarToggle.setAttribute('aria-expanded', !isExpanded);
        navbarMenu.classList.toggle('navbar__menu--active');

        // Gestion du focus pour l'accessibilité
        if (!isExpanded) {
          const firstLink = navbarMenu.querySelector('.navbar__link');
          if (firstLink) firstLink.focus();
        } else {
          navbarToggle.focus();
        }
      });

      // Fermer le menu sur clic lien
      navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
          navbarToggle.setAttribute('aria-expanded', 'false');
          navbarMenu.classList.remove('navbar__menu--active');
        });
      });

      // Fermer le menu sur Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navbarMenu.classList.contains('navbar__menu--active')) {
          navbarToggle.setAttribute('aria-expanded', 'false');
          navbarMenu.classList.remove('navbar__menu--active');
          navbarToggle.focus();
        }
      });

      // Fermer le menu sur clic extérieur
      document.addEventListener('click', (e) => {
        if (navbarMenu.classList.contains('navbar__menu--active') &&
            !navbarMenu.contains(e.target) &&
            !navbarToggle.contains(e.target)) {
          navbarToggle.setAttribute('aria-expanded', 'false');
          navbarMenu.classList.remove('navbar__menu--active');
        }
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

  function initForm() {
    const appointmentForm = $('#appointmentForm');
    if (!appointmentForm) return;

    const formInputs = $$('.form__input, .form__select, .form__textarea');
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');

    // Validation en temps réel
    formInputs.forEach(input => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', clearFieldError);
    });

    // Soumission du formulaire
    appointmentForm.addEventListener('submit', handleFormSubmit);

    function validateField(e) {
      const field = e.target;
      const isValid = field.checkValidity();

      if (!isValid && field.value.trim()) {
        field.classList.add('form__input--error');
      } else {
        field.classList.remove('form__input--error');
      }
    }

    function clearFieldError(e) {
      const field = e.target;
      if (field.value.trim()) {
        field.classList.remove('form__input--error');
      }
    }

    function handleFormSubmit(e) {
      e.preventDefault();

      const isValid = appointmentForm.checkValidity();

      if (!isValid) {
        formInputs.forEach(input => {
          if (!input.checkValidity()) {
            input.classList.add('form__input--error');
          }
        });
        return;
      }

      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Envoi en cours...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showNotification('Votre demande de rendez-vous a été envoyée avec succès !', 'success');
        appointmentForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1500);
    }
  }

  // ============================================================================
  // NOTIFICATIONS - Fonction globale
  // ============================================================================

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    notification.innerHTML = `
      <div class="notification__content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}" aria-hidden="true"></i>
        <span>${message}</span>
      </div>
      <button class="notification__close" aria-label="Fermer la notification">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#00d4aa' : '#667eea'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 1rem;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      max-width: 400px;
      font-family: inherit;
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    const autoClose = setTimeout(() => {
      closeNotification(notification);
    }, 5000);

    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoClose);
      closeNotification(notification);
    });
  }

  function closeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // ============================================================================
  // ANIMATIONS - Initialisation différée
  // ============================================================================

  function initAnimations() {
    if (!('IntersectionObserver' in window)) {
      const elements = $$('.traitement-card, .team-member, .contact__item, .cabinet__placeholder');
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const animatedElements = $$('.traitement-card, .team-member, .contact__item, .cabinet__placeholder');
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      observer.observe(el);
    });
  }

  // ============================================================================
  // EFFETS HOVER - Initialisation différée
  // ============================================================================

  function initHoverEffects() {
    // Effet sur les cartes
    $$('.card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });

    // Effet sur les icônes
    $$('.service-card__icon').forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.05)';
      });
      icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
      });
    });
  }

  // ============================================================================
  // RESPONSIVE - Initialisation différée
  // ============================================================================

  function initResponsive() {
    const navbarToggle = $('.navbar__toggle');
    const navbarMenu = $('.navbar__menu--mobile');

    const handleResize = debounce(() => {
      if (window.innerWidth > 768) {
        if (navbarToggle && navbarMenu) {
          navbarToggle.setAttribute('aria-expanded', 'false');
          navbarMenu.classList.remove('navbar__menu--active');
        }
      }
    }, 250);

    window.addEventListener('resize', handleResize);
  }

  // ============================================================================
  // ACCESSIBILITÉ - Initialisation différée
  // ============================================================================

  function initAccessibility() {
    // Amélioration de l'accessibilité des liens
    $$('a[href^="mailto:"], a[href^="tel:"]').forEach(link => {
      link.setAttribute('rel', 'noopener');
    });
  }

  // ============================================================================
  // PERFORMANCE - Initialisation différée
  // ============================================================================

  function initPerformance() {
    // Lazy loading des images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      $$('img[data-src]').forEach(img => imageObserver.observe(img));
    }
  }

  // ============================================================================
  // ANALYTICS - Initialisation différée
  // ============================================================================

  function initAnalytics() {
    // Tracking des interactions importantes
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

    // Tracking des soumissions de formulaire
    const form = $('#appointmentForm');
    if (form) {
      form.addEventListener('submit', () => {
        trackEvent('engagement', 'form_submit', 'appointment_form');
      });
    }
  }

  // ============================================================================
  // COPYRIGHT - Initialisation immédiate (critique)
  // ============================================================================

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

  // Initialisation critique immédiate (ne bloque pas le rendu)
  function initCritical() {
    // Seul le copyright est critique pour le rendu initial
    updateCopyright();

    // Amélioration du LCP - rendre visible le titre hero immédiatement
    const heroTitle = $('#hero-title');
    if (heroTitle) {
      heroTitle.style.opacity = '1';
    }
  }

  // Initialisation des fonctionnalités non-critiques (différée)
  function initNonCritical() {
    defer(() => {
      initNavigation();
      initSmoothScroll();
    });

    defer(() => {
      initForm();
      initResponsive();
      initAccessibility();
    });

    defer(() => {
      initAnimations();
      initHoverEffects();
      initPerformance();
      initAnalytics();
    });

    // Gestion du bouton retour en haut (différée)
    defer(() => {
      const sidebarScrollBtn = $('.sidebar__action[aria-label="Retour en haut"]');
      if (sidebarScrollBtn) {
        sidebarScrollBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const start = window.scrollY || window.pageYOffset;
          const duration = 700;
          const startTime = performance.now();
          function scrollStep(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, start * (1 - progress));
            if (progress < 1) {
              requestAnimationFrame(scrollStep);
            }
          }
          requestAnimationFrame(scrollStep);
        });
      }
    });
  }

  // Démarrage ultra-optimisé pour mobile
  function startApp() {
    // Initialisation critique immédiate
    initCritical();

    // Reporter tout le reste après le rendu complet
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        initNonCritical();
      }, { timeout: 2000 });
    } else {
      // Fallback pour navigateurs anciens
      setTimeout(() => {
        initNonCritical();
      }, 100);
    }
  }

  // Attendre que tout soit complètement chargé
  if (document.readyState === 'complete') {
    startApp();
  } else {
    window.addEventListener('load', startApp);
  }

})();
