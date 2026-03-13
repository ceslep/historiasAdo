<?php
include_once("cors.php");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/usage_stats.json';
$sessionsFile = __DIR__ . '/usage_sessions.json';

// Default stats structure
$defaultStats = [
    'searchCount' => 0,
    'pdfExportCount' => 0,
    'historyViewCount' => 0,
    'appOpenCount' => 0,
    'lastActive' => null
];

// Ensure files exist
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode($defaultStats));
}
if (!file_exists($sessionsFile)) {
    file_put_contents($sessionsFile, json_encode([]));
}

// Handle GET request to read stats
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $includeSessions = isset($_GET['sessions']);
    $content = file_get_contents($dataFile);
    $stats = $content ? json_decode($content, true) : $defaultStats;
    $stats = array_merge($defaultStats, $stats);

    if ($includeSessions) {
        $sessionsContent = file_get_contents($sessionsFile);
        $sessions = $sessionsContent ? json_decode($sessionsContent, true) : [];
        $stats['sessions'] = $sessions;
    }

    echo json_encode($stats);
    exit;
}

// Handle POST request to update stats
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['action'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing action']);
        exit;
    }

    // Use file locking to prevent race conditions during concurrent updates
    $fp = fopen($dataFile, 'c+');
    if (flock($fp, LOCK_EX)) {
        // Read current content
        fseek($fp, 0);
        $content = stream_get_contents($fp);
        $stats = $content ? json_decode($content, true) : $defaultStats;

        // Ensure all keys exist
        $stats = array_merge($defaultStats, $stats);

        // Process action
        switch ($data['action']) {
            case 'trackSearch':
                $stats['searchCount']++;
                break;
            case 'trackPdfExport':
                $stats['pdfExportCount']++;
                break;
            case 'trackHistoryView':
                $stats['historyViewCount']++;
                break;
            case 'trackAppOpen':
                $stats['appOpenCount']++;
                // Log client session info
                logSession($sessionsFile, $data);
                break;
            case 'resetStats':
                $stats = $defaultStats;
                // Also clear sessions
                file_put_contents($sessionsFile, json_encode([]));
                break;
            default:
                flock($fp, LOCK_UN);
                fclose($fp);
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
                exit;
        }

        $stats['lastActive'] = time() * 1000; // js timestamp

        // Write new content
        ftruncate($fp, 0);
        fseek($fp, 0);
        fwrite($fp, json_encode($stats));

        // Unlock and close
        flock($fp, LOCK_UN);
        fclose($fp);

        echo json_encode($stats);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Could not lock file for writing']);
    }
}

/**
 * Log a client session with detailed info
 */
function logSession(string $sessionsFile, array $data): void {
    $fp = fopen($sessionsFile, 'c+');
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return;
    }

    fseek($fp, 0);
    $content = stream_get_contents($fp);
    $sessions = $content ? json_decode($content, true) : [];
    if (!is_array($sessions)) $sessions = [];

    // Gather server-side info
    $ip = getClientIp();
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido';
    $acceptLang = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'Desconocido';
    $referer = $_SERVER['HTTP_REFERER'] ?? null;
    $parsedUA = parseUserAgent($userAgent);

    // Client-side info sent from frontend
    $clientInfo = $data['clientInfo'] ?? [];

    $session = [
        'timestamp' => time() * 1000,
        'date' => date('Y-m-d H:i:s'),
        // Server-side data
        'ip' => $ip,
        'userAgent' => $userAgent,
        'browser' => $parsedUA['browser'],
        'browserVersion' => $parsedUA['version'],
        'os' => $parsedUA['os'],
        'device' => $parsedUA['device'],
        'acceptLanguage' => $acceptLang,
        'referer' => $referer,
        // Client-side data
        'screenWidth' => $clientInfo['screenWidth'] ?? null,
        'screenHeight' => $clientInfo['screenHeight'] ?? null,
        'viewportWidth' => $clientInfo['viewportWidth'] ?? null,
        'viewportHeight' => $clientInfo['viewportHeight'] ?? null,
        'devicePixelRatio' => $clientInfo['devicePixelRatio'] ?? null,
        'colorDepth' => $clientInfo['colorDepth'] ?? null,
        'timezone' => $clientInfo['timezone'] ?? null,
        'language' => $clientInfo['language'] ?? null,
        'languages' => $clientInfo['languages'] ?? null,
        'platform' => $clientInfo['platform'] ?? null,
        'cookiesEnabled' => $clientInfo['cookiesEnabled'] ?? null,
        'online' => $clientInfo['online'] ?? null,
        'hardwareConcurrency' => $clientInfo['hardwareConcurrency'] ?? null,
        'deviceMemory' => $clientInfo['deviceMemory'] ?? null,
        'maxTouchPoints' => $clientInfo['maxTouchPoints'] ?? null,
        'connection' => $clientInfo['connection'] ?? null,
        'standalone' => $clientInfo['standalone'] ?? null,
    ];

    // Keep only last 100 sessions
    $sessions[] = $session;
    if (count($sessions) > 100) {
        $sessions = array_slice($sessions, -100);
    }

    ftruncate($fp, 0);
    fseek($fp, 0);
    fwrite($fp, json_encode($sessions));
    flock($fp, LOCK_UN);
    fclose($fp);
}

/**
 * Get the real client IP behind proxies
 */
function getClientIp(): string {
    $headers = [
        'HTTP_CF_CONNECTING_IP',     // Cloudflare
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_REAL_IP',
        'HTTP_CLIENT_IP',
        'REMOTE_ADDR'
    ];
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ips = explode(',', $_SERVER[$header]);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return 'Desconocida';
}

/**
 * Parse user agent string to extract browser, OS, and device info
 */
function parseUserAgent(string $ua): array {
    $result = ['browser' => 'Otro', 'version' => '', 'os' => 'Otro', 'device' => 'Escritorio'];

    // Browser detection
    if (preg_match('/Edg[e\/]?([\d.]+)/i', $ua, $m)) {
        $result['browser'] = 'Edge';
        $result['version'] = $m[1];
    } elseif (preg_match('/OPR\/([\d.]+)/i', $ua, $m)) {
        $result['browser'] = 'Opera';
        $result['version'] = $m[1];
    } elseif (preg_match('/SamsungBrowser\/([\d.]+)/i', $ua, $m)) {
        $result['browser'] = 'Samsung Internet';
        $result['version'] = $m[1];
    } elseif (preg_match('/Chrome\/([\d.]+)/i', $ua, $m) && !preg_match('/Edg/i', $ua)) {
        $result['browser'] = 'Chrome';
        $result['version'] = $m[1];
    } elseif (preg_match('/Firefox\/([\d.]+)/i', $ua, $m)) {
        $result['browser'] = 'Firefox';
        $result['version'] = $m[1];
    } elseif (preg_match('/Safari\/([\d.]+)/i', $ua, $m) && preg_match('/Version\/([\d.]+)/i', $ua, $v)) {
        $result['browser'] = 'Safari';
        $result['version'] = $v[1];
    }

    // OS detection
    if (preg_match('/Windows NT ([\d.]+)/i', $ua, $m)) {
        $winVersions = ['10.0' => '10/11', '6.3' => '8.1', '6.2' => '8', '6.1' => '7'];
        $result['os'] = 'Windows ' . ($winVersions[$m[1]] ?? $m[1]);
    } elseif (preg_match('/Mac OS X ([\d_]+)/i', $ua, $m)) {
        $result['os'] = 'macOS ' . str_replace('_', '.', $m[1]);
    } elseif (preg_match('/Android ([\d.]+)/i', $ua, $m)) {
        $result['os'] = 'Android ' . $m[1];
    } elseif (preg_match('/iPhone OS ([\d_]+)/i', $ua, $m)) {
        $result['os'] = 'iOS ' . str_replace('_', '.', $m[1]);
    } elseif (preg_match('/iPad.*OS ([\d_]+)/i', $ua, $m)) {
        $result['os'] = 'iPadOS ' . str_replace('_', '.', $m[1]);
    } elseif (preg_match('/Linux/i', $ua)) {
        $result['os'] = 'Linux';
    } elseif (preg_match('/CrOS/i', $ua)) {
        $result['os'] = 'Chrome OS';
    }

    // Device detection
    if (preg_match('/Mobile|Android.*Mobile|iPhone/i', $ua)) {
        $result['device'] = 'Móvil';
    } elseif (preg_match('/Tablet|iPad/i', $ua)) {
        $result['device'] = 'Tablet';
    }

    return $result;
}
?>
