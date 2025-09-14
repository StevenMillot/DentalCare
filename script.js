/**
 * Cabinet DR Raphaël BROCHAND - JavaScript léger et performant
 * Optimisé pour les performances et l'accessibilité
 */

(function() {
  'use strict';

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // Debounce pour optimiser les performances
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const navbar = $('.navbar');
  const navbarToggle = $('.navbar__toggle');
  const navbarMenu = $('.navbar__menu');
  const navbarLinks = $$('.navbar__link');

                // Toggle menu mobile
              if (navbarToggle && navbarMenu) {
                navbarToggle.addEventListener('click', () => {
                  const isExpanded = navbarToggle.getAttribute('aria-expanded') === 'true';
                  navbarToggle.setAttribute('aria-expanded', !isExpanded);
                  navbarMenu.classList.toggle('navbar__menu--active');

                  // Gestion du focus pour l'accessibilité
                  if (!isExpanded) {
                    // Menu ouvert - focus sur le premier lien
                    const firstLink = navbarMenu.querySelector('.navbar__link');
                    if (firstLink) firstLink.focus();
                  } else {
                    // Menu fermé - focus sur le bouton toggle
                    navbarToggle.focus();
                  }
                });

                // Fermer le menu en cliquant sur un lien
                navbarLinks.forEach(link => {
                  link.addEventListener('click', () => {
                    navbarToggle.setAttribute('aria-expanded', 'false');
                    navbarMenu.classList.remove('navbar__menu--active');
                  });
                });

                // Fermer le menu avec la touche Escape
                document.addEventListener('keydown', (e) => {
                  if (e.key === 'Escape' && navbarMenu.classList.contains('navbar__menu--active')) {
                    navbarToggle.setAttribute('aria-expanded', 'false');
                    navbarMenu.classList.remove('navbar__menu--active');
                    navbarToggle.focus();
                  }
                });
              }

  // Navigation sticky avec effet de transparence
  const handleScroll = debounce(() => {
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  }, 10);

  window.addEventListener('scroll', handleScroll);

  // ============================================================================
  // SMOOTH SCROLL
  // ============================================================================

  // Smooth scroll pour les liens d'ancrage
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = $(this.getAttribute('href'));

      if (target) {
        const offsetTop = target.offsetTop - 70; // Ajustement pour la navbar fixe
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================================================
  // FORMULAIRE
  // ============================================================================

  const appointmentForm = $('#appointmentForm');

  if (appointmentForm) {
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

      // Validation complète
      const isValid = appointmentForm.checkValidity();

      if (!isValid) {
        formInputs.forEach(input => {
          if (!input.checkValidity()) {
            input.classList.add('form__input--error');
          }
        });
        return;
      }

      // Simulation d'envoi
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
  // NOTIFICATIONS
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

    // Styles inline pour éviter les FOUC
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

    // Animation d'entrée
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    // Fermeture automatique
    const autoClose = setTimeout(() => {
      closeNotification(notification);
    }, 5000);

    // Fermeture manuelle
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
  // ANIMATIONS LÉGÈRES
  // ============================================================================

  // Intersection Observer pour les animations d'apparition
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observer les éléments à animer
  const animatedElements = $$('.traitement-card, .team-member, .contact__item, .cabinet__placeholder');

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
  });

  // ============================================================================
  // EFFETS DE HOVER LÉGERS
  // ============================================================================

  // Effet de hover sur les cartes
  $$('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });

  // Effet de hover sur les icônes
  $$('.service-card__icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.05)';
    });

    icon.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1)';
    });
  });

  // ============================================================================
  // RESPONSIVE
  // ============================================================================

  // Gestion du responsive pour le menu mobile
  const handleResize = debounce(() => {
    if (window.innerWidth > 768) {
      navbarToggle.setAttribute('aria-expanded', 'false');
      navbarMenu.classList.remove('navbar__menu--active');
    }
  }, 250);

  window.addEventListener('resize', handleResize);

  // ============================================================================
  // ACCESSIBILITÉ
  // ============================================================================

  // Gestion du focus pour l'accessibilité
  document.addEventListener('keydown', (e) => {
    // Échap pour fermer le menu mobile
    if (e.key === 'Escape') {
      navbarToggle.setAttribute('aria-expanded', 'false');
      navbarMenu.classList.remove('navbar__menu--active');
    }
  });

  // Amélioration de l'accessibilité des liens
  $$('a[href^="mailto:"], a[href^="tel:"]').forEach(link => {
    link.setAttribute('rel', 'noopener');
  });

  // ============================================================================
  // PERFORMANCE
  // ============================================================================

  // Lazy loading des images (si ajoutées plus tard)
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

  // Préchargement des ressources critiques
  const preloadLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
  ];

  preloadLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });

  // ============================================================================
  // ANALYTICS (optionnel)
  // ============================================================================

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
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', () => {
      trackEvent('engagement', 'form_submit', 'appointment_form');
    });
  }

  // ============================================================================
  // COPYRIGHT AUTOMATIQUE
  // ============================================================================

  // Mise à jour automatique du copyright
  function updateCopyright() {
    const currentYear = new Date().getFullYear();
    const copyrightYearElements = $$('.copyright-year');

    copyrightYearElements.forEach(element => {
      element.textContent = currentYear;
    });
  }

  // ============================================================================
  // INITIALISATION
  // ============================================================================

  // Initialisation au chargement du DOM
  document.addEventListener('DOMContentLoaded', () => {
    // Mise à jour du copyright
    updateCopyright();

    // Vérification de la compatibilité
    if (!('IntersectionObserver' in window)) {
      // Fallback pour les navigateurs plus anciens
      animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }

    // Amélioration du LCP (Largest Contentful Paint)
    const heroTitle = $('#hero-title');
    if (heroTitle) {
      heroTitle.style.opacity = '1';
    }
  });

  // Initialisation au chargement complet
  window.addEventListener('load', () => {
    // Optimisation des performances après chargement
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Tâches non critiques
        console.log('Site chargé et optimisé');
      });
    }
  });

  // Amélioration du smooth scroll pour le bouton retour en haut de la sidebar
  const sidebarScrollBtn = document.querySelector('.sidebar__action[aria-label="Retour en haut"]');
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

})();
