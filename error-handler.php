<?php
/**
 * GESTIONNAIRE D'ERREURS PHP - PARO-SPE.FR
 * 
 * Capture et log les erreurs PHP.
 * À inclure en haut de chaque script PHP si nécessaire.
 * 
 * Usage: require_once 'error-handler.php';
 */

// Configuration
define('ERROR_LOG_FILE', __DIR__ . '/logs/php-errors.log');
define('ERROR_LOG_ENABLED', true);
define('ERROR_DISPLAY', false); // Ne pas afficher les erreurs en production

// Créer le dossier de logs s'il n'existe pas
if (!is_dir(__DIR__ . '/logs')) {
    @mkdir(__DIR__ . '/logs', 0755, true);
}

// Configuration de la gestion des erreurs
error_reporting(E_ALL);
ini_set('display_errors', ERROR_DISPLAY ? '1' : '0');
ini_set('log_errors', ERROR_LOG_ENABLED ? '1' : '0');
ini_set('error_log', ERROR_LOG_FILE);

/**
 * Gestionnaire d'erreurs personnalisé
 */
function customErrorHandler($errno, $errstr, $errfile, $errline) {
    // Ne pas traiter les erreurs supprimées avec @
    if (!(error_reporting() & $errno)) {
        return false;
    }

    $errorTypes = [
        E_ERROR             => 'ERROR',
        E_WARNING           => 'WARNING',
        E_PARSE             => 'PARSE',
        E_NOTICE            => 'NOTICE',
        E_CORE_ERROR        => 'CORE_ERROR',
        E_CORE_WARNING      => 'CORE_WARNING',
        E_COMPILE_ERROR     => 'COMPILE_ERROR',
        E_COMPILE_WARNING   => 'COMPILE_WARNING',
        E_USER_ERROR        => 'USER_ERROR',
        E_USER_WARNING      => 'USER_WARNING',
        E_USER_NOTICE       => 'USER_NOTICE',
        E_STRICT            => 'STRICT',
        E_RECOVERABLE_ERROR => 'RECOVERABLE_ERROR',
        E_DEPRECATED        => 'DEPRECATED',
        E_USER_DEPRECATED   => 'USER_DEPRECATED'
    ];

    $errorType = isset($errorTypes[$errno]) ? $errorTypes[$errno] : 'UNKNOWN';

    // Formater le message
    $logMessage = sprintf(
        "[%s] %s: %s in %s on line %d\n",
        date('Y-m-d H:i:s'),
        $errorType,
        $errstr,
        $errfile,
        $errline
    );

    // Logger l'erreur
    if (ERROR_LOG_ENABLED) {
        error_log($logMessage, 3, ERROR_LOG_FILE);
    }

    // En production, afficher une page d'erreur générique
    if (!ERROR_DISPLAY && in_array($errno, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        header('HTTP/1.1 500 Internal Server Error');
        include '500.html';
        exit;
    }

    // Ne pas exécuter le gestionnaire d'erreurs PHP interne
    return true;
}

/**
 * Gestionnaire d'exceptions non capturées
 */
function customExceptionHandler($exception) {
    $logMessage = sprintf(
        "[%s] EXCEPTION: %s in %s on line %d\nStack trace:\n%s\n\n",
        date('Y-m-d H:i:s'),
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine(),
        $exception->getTraceAsString()
    );

    // Logger l'exception
    if (ERROR_LOG_ENABLED) {
        error_log($logMessage, 3, ERROR_LOG_FILE);
    }

    // Afficher une page d'erreur générique
    if (!ERROR_DISPLAY) {
        header('HTTP/1.1 500 Internal Server Error');
        if (file_exists('500.html')) {
            include '500.html';
        } else {
            echo '<!DOCTYPE html><html><head><title>Erreur</title></head><body>';
            echo '<h1>Une erreur est survenue</h1>';
            echo '<p>Veuillez réessayer ultérieurement.</p>';
            echo '</body></html>';
        }
        exit;
    } else {
        echo '<pre>' . htmlspecialchars($logMessage) . '</pre>';
    }
}

/**
 * Gestionnaire d'arrêt (capture les erreurs fatales)
 */
function customShutdownHandler() {
    $error = error_get_last();
    
    if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        $logMessage = sprintf(
            "[%s] FATAL: %s in %s on line %d\n",
            date('Y-m-d H:i:s'),
            $error['message'],
            $error['file'],
            $error['line']
        );

        // Logger l'erreur fatale
        if (ERROR_LOG_ENABLED) {
            error_log($logMessage, 3, ERROR_LOG_FILE);
        }

        // Afficher une page d'erreur générique
        if (!ERROR_DISPLAY) {
            header('HTTP/1.1 500 Internal Server Error');
            if (file_exists('500.html')) {
                include '500.html';
            } else {
                echo '<!DOCTYPE html><html><head><title>Erreur</title></head><body>';
                echo '<h1>Une erreur est survenue</h1>';
                echo '<p>Veuillez réessayer ultérieurement.</p>';
                echo '</body></html>';
            }
        }
    }
}

// Enregistrer les gestionnaires
set_error_handler('customErrorHandler');
set_exception_handler('customExceptionHandler');
register_shutdown_function('customShutdownHandler');

/**
 * Fonction utilitaire pour logger des événements personnalisés
 */
function logEvent($message, $level = 'INFO') {
    if (!ERROR_LOG_ENABLED) {
        return;
    }

    $logMessage = sprintf(
        "[%s] %s: %s\n",
        date('Y-m-d H:i:s'),
        $level,
        $message
    );

    error_log($logMessage, 3, ERROR_LOG_FILE);
}
?>
