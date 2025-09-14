/**
 * Script ultra-léger pour performances mobiles maximales
 * Ne s'exécute qu'après le rendu complet
 */

(function() {
  'use strict';

  // Utilitaires minimaux
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // Debounce léger
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Copyright immédiat (critique)
  function updateCopyright() {
    const year = new Date().getFullYear();
    $$('.copyright-year').forEach(el => el.textContent = year);
  }

  // Navigation mobile minimale
  function initMobileNav() {
    const toggle = $('.navbar__toggle');
    const menu = $('.navbar__menu--mobile');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isOpen);
      menu.classList.toggle('navbar__menu--active');
    });

    // Fermer sur clic lien
    $$('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('navbar__menu--active');
      });
    });
  }

  // Smooth scroll minimal
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 70,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Sidebar minimale
  function initSidebar() {
    const sidebar = $('.sidebar');
    const footer = $('.footer');
    if (!sidebar || !footer) return;

    let isAdjusted = false;

    function checkPosition() {
      const sidebarRect = sidebar.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const shouldAdjust = sidebarRect.bottom > (footerRect.top - 20);

      if (shouldAdjust && !isAdjusted) {
        const overlap = sidebarRect.bottom - (footerRect.top - 20);
        sidebar.style.bottom = `${Math.max(20, overlap + 20)}px`;
        sidebar.classList.add('sidebar--adjusted');
        isAdjusted = true;
      } else if (!shouldAdjust && isAdjusted) {
        sidebar.style.bottom = '';
        sidebar.classList.remove('sidebar--adjusted');
        isAdjusted = false;
      }
    }

    const debouncedCheck = debounce(checkPosition, 100);
    window.addEventListener('scroll', debouncedCheck, { passive: true });
    window.addEventListener('resize', debouncedCheck);
    setTimeout(checkPosition, 100);
  }

  // Formulaire minimal
  function initForm() {
    const form = $('#appointmentForm');
    if (!form) return;

    const inputs = $$('.form__input, .form__select, .form__textarea');
    const submitBtn = form.querySelector('button[type="submit"]');

    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        if (!this.checkValidity() && this.value.trim()) {
          this.classList.add('form__input--error');
        } else {
          this.classList.remove('form__input--error');
        }
      });
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        inputs.forEach(input => {
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
        alert('Votre demande de rendez-vous a été envoyée avec succès !');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  // Initialisation ultra-différée
  function init() {
    // Critique immédiat
    updateCopyright();

    // Non-critique différé
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        initMobileNav();
        initSmoothScroll();
        initSidebar();
        initForm();
      }, { timeout: 3000 });
    } else {
      setTimeout(() => {
        initMobileNav();
        initSmoothScroll();
        initSidebar();
        initForm();
      }, 200);
    }
  }

  // Attendre le chargement complet
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();
