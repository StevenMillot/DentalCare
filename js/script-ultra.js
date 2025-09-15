/**
 * Script ultra-optimisé pour performances maximales
 * Version simplifiée sans sidebar
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

  // Copyright immédiat
  function updateCopyright() {
    const year = new Date().getFullYear();
    $$('.copyright-year').forEach(el => el.textContent = year);
  }

  // Navigation mobile
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

    // Fermer sur Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('navbar__menu--active')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('navbar__menu--active');
        toggle.focus();
      }
    });

    // Fermer sur clic extérieur
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('navbar__menu--active') &&
          !menu.contains(e.target) &&
          !toggle.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('navbar__menu--active');
      }
    });
  }

  // Smooth scroll
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

  // Sidebar simple - sans collision footer
  function initSidebar() {
    const sidebar = $('.sidebar');
    if (!sidebar) return;

    // Gestion du bouton retour en haut
    const scrollToTop = $('#scrollToTop');
    if (scrollToTop) {
      scrollToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // Les autres boutons fonctionnent avec les liens normaux
    // Pas de logique de collision - position fixe simple
  }

  // Formulaire
  function initForm() {
    const form = $('#appointmentForm');
    if (!form) return;

    const inputs = $$('.form__input, .form__select, .form__textarea');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validation en temps réel
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        if (!this.checkValidity() && this.value.trim()) {
          this.classList.add('form__input--error');
        } else {
          this.classList.remove('form__input--error');
        }
      });

      input.addEventListener('input', function() {
        if (this.value.trim()) {
          this.classList.remove('form__input--error');
        }
      });
    });

    // Soumission
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

  // Animations simples
  function initAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    const elements = $$('.traitement-card, .team-member, .contact__item, .cabinet__placeholder');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      observer.observe(el);
    });
  }

  // Effets hover
  function initHoverEffects() {
    $$('.card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  // Responsive
  function initResponsive() {
    const toggle = $('.navbar__toggle');
    const menu = $('.navbar__menu--mobile');

    const handleResize = debounce(() => {
      if (window.innerWidth > 768) {
        if (toggle && menu) {
          toggle.setAttribute('aria-expanded', 'false');
          menu.classList.remove('navbar__menu--active');
        }
      }
    }, 250);

    window.addEventListener('resize', handleResize);
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
        initResponsive();
      }, { timeout: 2000 });

      requestIdleCallback(() => {
        initAnimations();
        initHoverEffects();
      }, { timeout: 3000 });
    } else {
      setTimeout(() => {
        initMobileNav();
        initSmoothScroll();
        initSidebar();
        initForm();
        initResponsive();
      }, 100);

      setTimeout(() => {
        initAnimations();
        initHoverEffects();
      }, 500);
    }
  }

  // Attendre le chargement complet
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();
