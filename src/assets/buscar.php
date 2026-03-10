<?php
include_once("cors.php");

$q = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($q)) {
    echo json_encode(['error' => 'Falta parámetro q']);
    exit;
}

$jsonFile = __DIR__ . '/paciente.json';

if (!file_exists($jsonFile)) {
    echo json_encode(['error' => 'Archivo no encontrado']);
    exit;
}

function globToRegex($pattern) {
    $pattern = preg_quote($pattern, '/');
    $pattern = str_replace(['\*', '\?'], ['.*', '.'], $pattern);
    return '/^' . $pattern . '$/i';
}

function matchWithWildcard($text, $query) {
    if (strpos($query, '*') !== false || strpos($query, '?') !== false) {
        $regex = globToRegex($query);
        return preg_match($regex, $text) === 1;
    }
    return false;
}

$results = [];
$qLower = mb_strtolower($q, 'UTF-8');
$hasWildcards = strpos($q, '*') !== false || strpos($q, '?') !== false;
$maxResults = 50;

if (!$hasWildcards) {
    $qWithWildcard = '*' . str_replace(' ', '*', $q) . '*';
    $qLowerWithWildcard = '*' . str_replace(' ', '*', $qLower) . '*';
} else {
    $qWithWildcard = '*' . str_replace(' ', '*', $q) . '*';
    $qLowerWithWildcard = '*' . str_replace(' ', '*', $qLower) . '*';
}

$handle = fopen($jsonFile, 'r');
if (!$handle) {
    echo json_encode(['error' => 'No se pudo abrir el archivo']);
    exit;
}

while (($line = fgets($handle)) !== false && count($results) < $maxResults) {
    $line = trim($line);
    
    if (empty($line)) {
        continue;
    }
    
    $paciente = json_decode($line, true);
    
    if (!$paciente || !isset($paciente['data']['datos'])) {
        continue;
    }
    
    $datos = $paciente['data']['datos'];
    
    $historia = isset($datos['historia']) ? strval($datos['historia']) : '';
    $ind = isset($datos['ind']) ? strval($datos['ind']) : '';
    $identificacion = isset($datos['identificacion']) ? strval($datos['identificacion']) : '';
    $nombres = isset($datos['nombres']) ? mb_strtolower($datos['nombres'], 'UTF-8') : '';
    
    $match = false;
    
    if (strval($q) === strval($historia) || strval($q) === strval($ind)) {
        $match = true;
    }
    elseif (matchWithWildcard($identificacion, $qWithWildcard)) {
        $match = true;
    }
    elseif (matchWithWildcard($nombres, $qLowerWithWildcard)) {
        $match = true;
    }
    
    if ($match) {
        $results[] = $paciente;
    }
}

fclose($handle);

echo json_encode([
    'total' => count($results),
    'results' => $results
], JSON_UNESCAPED_UNICODE);
