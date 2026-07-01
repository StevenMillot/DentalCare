/**
 * SYSTÈME DE MONITORING ET LOGS D'ERREURS - PARO-SPE.FR
 * 
 * Ce script capture les erreurs JavaScript et les envoie à un système de monitoring.
 * Il peut être configuré pour utiliser différents services (Sentry, LogRocket, etc.)
 * ou simplement logger dans la console en développement.
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Activer le monitoring en production uniquement
        enabled: window.location.hostname === 'paro-spe.fr' || window.location.hostname === 'www.paro-spe.fr',
        
        // Endpoint pour envoyer les logs (optionnel - à configurer avec votre service)
        logEndpoint: null, // Exemple: 'https://votre-service-monitoring.com/api/logs'
        
        // Nom du projet
        projectName: 'paro-spe',
        
        // Version du site (à mettre à jour à chaque déploiement)
        version: '1.0.0',
        
        // Environnement
        environment: window.location.hostname.includes('localhost') ? 'development' : 'production',
        
        // Taux d'échantillonnage (1.0 = 100%, 0.1 = 10%)
        sampleRate: 1.0
    };

    // Ne rien faire si le monitoring est désactivé
    if (!CONFIG.enabled) {
        console.log('[Monitoring] Désactivé en développement');
        return;
    }

    // Informations sur la session
    const SESSION_INFO = {
        sessionId: generateSessionId(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer || 'direct'
    };

    /**
     * Génère un ID de session unique
     */
    function generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Envoie un log au serveur ou dans la console
     */
    function sendLog(logData) {
        // Échantillonnage
        if (Math.random() > CONFIG.sampleRate) {
            return;
        }

        const payload = {
            ...logData,
            project: CONFIG.projectName,
            version: CONFIG.version,
            environment: CONFIG.environment,
            session: SESSION_INFO
        };

        // Logger dans la console en développement
        console.group(`[Monitoring] ${logData.type}`);
        console.error(logData.message);
        console.log('Détails:', payload);
        console.groupEnd();

        // Envoyer au serveur si un endpoint est configuré
        if (CONFIG.logEndpoint) {
            try {
                // Utiliser sendBeacon pour une fiabilité maximale
                if (navigator.sendBeacon) {
                    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                    navigator.sendBeacon(CONFIG.logEndpoint, blob);
                } else {
                    // Fallback avec fetch
                    fetch(CONFIG.logEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        keepalive: true
                    }).catch(() => {
                        // Ignorer les erreurs d'envoi pour ne pas créer de boucle
                    });
                }
            } catch (e) {
                // Ignorer les erreurs d'envoi
            }
        }

        // Stocker localement pour analyse ultérieure (optionnel)
        storeErrorLocally(payload);
    }

    /**
     * Stocke l'erreur localement dans localStorage
     */
    function storeErrorLocally(error) {
        try {
            const storageKey = 'paro-spe-errors';
            const maxErrors = 50; // Limite de stockage
            
            let errors = JSON.parse(localStorage.getItem(storageKey) || '[]');
            errors.push({
                ...error,
                storedAt: Date.now()
            });
            
            // Garder seulement les N dernières erreurs
            if (errors.length > maxErrors) {
                errors = errors.slice(-maxErrors);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(errors));
        } catch (e) {
            // Ignorer si localStorage n'est pas disponible
        }
    }

    /**
     * Capturer les erreurs JavaScript globales
     */
    window.addEventListener('error', function(event) {
        sendLog({
            type: 'javascript-error',
            message: event.message,
            source: event.filename,
            line: event.lineno,
            column: event.colno,
            stack: event.error ? event.error.stack : null,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Capturer les promesses non gérées
     */
    window.addEventListener('unhandledrejection', function(event) {
        sendLog({
            type: 'unhandled-promise',
            message: event.reason ? event.reason.message || event.reason : 'Promise rejection',
            stack: event.reason ? event.reason.stack : null,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * Capturer les erreurs de chargement de ressources
     */
    window.addEventListener('error', function(event) {
        if (event.target !== window && (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
            sendLog({
                type: 'resource-error',
                message: `Failed to load ${event.target.tagName}`,
                resource: event.target.src || event.target.href,
                timestamp: new Date().toISOString()
            });
        }
    }, true);

    /**
     * Monitorer les performances
     */
    if (window.PerformanceObserver) {
        try {
            // Long Tasks (tâches > 50ms)
            const longTaskObserver = new PerformanceObserver(function(list) {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 100) { // Seulement si > 100ms
                        sendLog({
                            type: 'performance-long-task',
                            message: 'Long task detected',
                            duration: entry.duration,
                            startTime: entry.startTime,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            });
            
            if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            }
        } catch (e) {
            // PerformanceObserver non supporté
        }
    }

    /**
     * Monitorer la visibilité de la page (pour détecter les crashes)
     */
    let pageVisible = true;
    let lastActivityTime = Date.now();

    document.addEventListener('visibilitychange', function() {
        pageVisible = !document.hidden;
        
        if (pageVisible) {
            const hiddenDuration = Date.now() - lastActivityTime;
            
            // Si la page était cachée > 30s, logger une reprise
            if (hiddenDuration > 30000) {
                sendLog({
                    type: 'page-resume',
                    message: 'Page resumed after long inactivity',
                    duration: hiddenDuration,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            lastActivityTime = Date.now();
        }
    });

    /**
     * Métriques de performance au chargement
     */
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                const firstByte = timing.responseStart - timing.navigationStart;

                // Logger si les performances sont dégradées
                if (loadTime > 5000 || firstByte > 2000) {
                    sendLog({
                        type: 'performance-slow-load',
                        message: 'Slow page load detected',
                        metrics: {
                            loadTime,
                            domReady,
                            firstByte,
                            dns: timing.domainLookupEnd - timing.domainLookupStart,
                            tcp: timing.connectEnd - timing.connectStart,
                            request: timing.responseStart - timing.requestStart,
                            response: timing.responseEnd - timing.responseStart,
                            dom: timing.domComplete - timing.domLoading
                        },
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }, 0);
    });

    /**
     * API publique pour logger des événements personnalisés
     */
    window.ParoSpeMonitoring = {
        logEvent: function(eventName, data) {
            sendLog({
                type: 'custom-event',
                message: eventName,
                data: data,
                timestamp: new Date().toISOString()
            });
        },
        
        logError: function(message, context) {
            sendLog({
                type: 'manual-error',
                message: message,
                context: context,
                timestamp: new Date().toISOString()
            });
        },
        
        getStoredErrors: function() {
            try {
                return JSON.parse(localStorage.getItem('paro-spe-errors') || '[]');
            } catch (e) {
                return [];
            }
        },
        
        clearStoredErrors: function() {
            try {
                localStorage.removeItem('paro-spe-errors');
            } catch (e) {
                // Ignorer
            }
        }
    };

    console.log('[Monitoring] Activé pour', CONFIG.projectName, 'v' + CONFIG.version);

})();
