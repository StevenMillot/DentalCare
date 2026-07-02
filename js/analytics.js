/**
 * GOOGLE ANALYTICS - MODE ANONYME (SANS COOKIES)
 * Site: Paro-Spé
 * 
 * Configuration conforme RGPD sans besoin de bandeau de cookies :
 * - Anonymisation des IP
 * - Pas de cookies
 * - Pas de données personnelles stockées
 * - Storage désactivé
 * 
 * ⚠️ IMPORTANT : Remplacez 'G-XXXXXXXXXX' par votre vrai ID de mesure Google Analytics
 */

(function() {
    'use strict';

    // ⚠️ À REMPLACER par votre ID de mesure Google Analytics
    // Exemple : 'G-ABC123DEF4' 
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

    // Ne charger GA que sur le domaine de production
    const isProduction = window.location.hostname === 'paro-spe.fr' || 
                         window.location.hostname === 'www.paro-spe.fr';

    // En développement, ne pas charger GA
    if (!isProduction) {
        console.log('[Analytics] Désactivé en développement');
        // Créer un gtag factice pour éviter les erreurs
        window.gtag = function() {
            console.log('[Analytics] gtag() appelé (mode dev):', arguments);
        };
        return;
    }

    // Vérifier que l'ID est configuré
    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.warn('[Analytics] ⚠️ ID de mesure Google Analytics non configuré. Éditez js/analytics.js');
        window.gtag = function() {};
        return;
    }

    // Configuration RGPD-friendly
    window['ga-disable-' + GA_MEASUREMENT_ID] = false;

    // Charger le script Google Analytics de manière asynchrone
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    
    // Gérer les erreurs de chargement
    script.onerror = function() {
        console.error('[Analytics] Impossible de charger Google Analytics');
    };
    
    document.head.appendChild(script);

    // Initialiser gtag (Google Tag)
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    window.gtag = gtag;

    // Configuration de base
    gtag('js', new Date());

    // Configuration ANONYME (SANS COOKIES) - Conforme RGPD
    gtag('config', GA_MEASUREMENT_ID, {
        // === ANONYMISATION (RGPD) ===
        'anonymize_ip': true,                      // Anonymiser les adresses IP
        'allow_google_signals': false,             // Désactiver les signaux Google
        'allow_ad_personalization_signals': false, // Désactiver la personnalisation des annonces
        
        // === DÉSACTIVATION DES COOKIES ===
        'client_storage': 'none',                  // AUCUN stockage côté client (pas de cookies)
        'cookie_flags': 'SameSite=None;Secure',    // Si des cookies sont créés malgré tout (ne devrait pas arriver)
        'cookie_expires': 0,                       // Les cookies expirent immédiatement
        
        // === TRACKING DES PAGES ===
        'send_page_view': true,                    // Envoyer les vues de page
        'page_title': document.title,              // Titre de la page
        'page_location': window.location.href,    // URL complète
        'page_path': window.location.pathname,     // Chemin uniquement
        
        // === AUTRES PARAMÈTRES ===
        'transport_type': 'beacon',                // Utiliser sendBeacon (plus fiable)
        'custom_map': {
            'dimension1': 'user_type'              // Dimension personnalisée (optionnel)
        }
    });

    console.log('[Analytics] Google Analytics chargé en mode anonyme (sans cookies) - ID:', GA_MEASUREMENT_ID);

    // Événements personnalisés utiles (optionnel)
    
    /**
     * Tracker les clics sortants (liens externes)
     */
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Liens externes
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            gtag('event', 'click', {
                'event_category': 'outbound',
                'event_label': href,
                'transport_type': 'beacon'
            });
        }
    });

    /**
     * Tracker les erreurs JavaScript
     */
    window.addEventListener('error', function(e) {
        gtag('event', 'exception', {
            'description': e.message,
            'fatal': false
        });
    });

    /**
     * API publique pour événements personnalisés
     */
    window.trackEvent = function(eventName, params) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params || {});
            console.log('[Analytics] Événement envoyé:', eventName, params);
        }
    };

})();
