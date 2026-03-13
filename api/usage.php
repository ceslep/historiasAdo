<?php
include_once("cors.php");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/usage_stats.json';

// Default stats structure
$defaultStats = [
    'searchCount' => 0,
    'pdfExportCount' => 0,
    'historyViewCount' => 0,
    'appOpenCount' => 0,
    'lastActive' => null
];

// Ensure file exists
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode($defaultStats));
}

// Handle GET request to read stats
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = file_get_contents($dataFile);
    echo $content ? $content : json_encode($defaultStats);
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
                break;
            case 'resetStats':
                $stats = $defaultStats;
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
?>