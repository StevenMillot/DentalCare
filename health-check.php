<?php
/**
 * HEALTH CHECK ENDPOINT - PARO-SPE.FR
 * 
 * Vérifie que le site fonctionne correctement.
 * Accessible via: https://paro-spe.fr/health-check.php
 * 
 * Retourne un JSON avec le statut du site et diverses métriques.
 */

header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Clé secrète pour accéder au health check (optionnel, pour sécurité)
// Définir dans .env.ovh: HEALTH_CHECK_SECRET=votre-cle-secrete
// Accès: https://paro-spe.fr/health-check.php?key=votre-cle-secrete
$healthCheckSecret = getenv('HEALTH_CHECK_SECRET');
$providedKey = isset($_GET['key']) ? $_GET['key'] : null;

// Si une clé est définie, la vérifier
if (!empty($healthCheckSecret) && $providedKey !== $healthCheckSecret) {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized'
    ]);
    exit;
}

// Fonction pour vérifier qu'un fichier existe et est lisible
function checkFile($path) {
    return file_exists($path) && is_readable($path);
}

// Fonction pour vérifier qu'un répertoire existe
function checkDirectory($path) {
    return is_dir($path) && is_readable($path);
}

// Collecter les informations
$checks = [];
$hasErrors = false;

// 1. Vérifier les fichiers essentiels
$essentialFiles = [
    'index.html',
    'css/bundle.css',
    'js/script.min.js',
    '.htaccess',
    'sitemap.xml',
    'robots.txt'
];

foreach ($essentialFiles as $file) {
    $exists = checkFile(__DIR__ . '/' . $file);
    $checks['files'][$file] = $exists;
    if (!$exists) {
        $hasErrors = true;
    }
}

// 2. Vérifier les répertoires
$essentialDirs = [
    'assets',
    'css',
    'js'
];

foreach ($essentialDirs as $dir) {
    $exists = checkDirectory(__DIR__ . '/' . $dir);
    $checks['directories'][$dir] = $exists;
    if (!$exists) {
        $hasErrors = true;
    }
}

// 3. Vérifier la configuration PHP
$checks['php'] = [
    'version' => phpversion(),
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time'),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size')
];

// 4. Vérifier l'espace disque
$diskFreeSpace = disk_free_space(__DIR__);
$diskTotalSpace = disk_total_space(__DIR__);
$diskUsedPercent = 100 - (($diskFreeSpace / $diskTotalSpace) * 100);

$checks['disk'] = [
    'free_space' => formatBytes($diskFreeSpace),
    'total_space' => formatBytes($diskTotalSpace),
    'used_percent' => round($diskUsedPercent, 2)
];

// Alerter si l'espace disque est critique (< 10% libre)
if ($diskUsedPercent > 90) {
    $hasErrors = true;
}

// 5. Vérifier les extensions PHP nécessaires
$requiredExtensions = ['json', 'mbstring', 'curl'];
$checks['php_extensions'] = [];

foreach ($requiredExtensions as $ext) {
    $loaded = extension_loaded($ext);
    $checks['php_extensions'][$ext] = $loaded;
    if (!$loaded) {
        $hasErrors = true;
    }
}

// 6. Vérifier les permissions (écriture dans le dossier si nécessaire)
$checks['permissions'] = [
    'root_writable' => is_writable(__DIR__)
];

// 7. Métriques de performance
$checks['performance'] = [
    'memory_usage' => formatBytes(memory_get_usage(true)),
    'memory_peak' => formatBytes(memory_get_peak_usage(true)),
    'generation_time_ms' => round(microtime(true) * 1000)
];

// 8. Informations serveur
$checks['server'] = [
    'software' => isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : 'Unknown',
    'hostname' => gethostname(),
    'document_root' => $_SERVER['DOCUMENT_ROOT'],
    'server_time' => date('Y-m-d H:i:s'),
    'server_timezone' => date_default_timezone_get()
];

// 9. Vérifier les headers de sécurité
$checks['security'] = [
    'https' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    'htaccess_exists' => checkFile(__DIR__ . '/.htaccess')
];

// Fonction utilitaire pour formater les octets
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));
    return round($bytes, $precision) . ' ' . $units[$pow];
}

// Préparer la réponse
$response = [
    'status' => $hasErrors ? 'warning' : 'ok',
    'timestamp' => date('c'),
    'checks' => $checks,
    'version' => '1.0.0',
    'environment' => 'production'
];

// Code HTTP selon le statut
http_response_code($hasErrors ? 500 : 200);

// Retourner le JSON
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
