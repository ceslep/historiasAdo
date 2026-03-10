<?php
include_once("cors.php");

$jsonFile = __DIR__ . '/paciente.json';

if (!file_exists($jsonFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Archivo no encontrado']);
    exit;
}

header('Content-Type: application/json');
header('Content-Disposition: inline');

$handle = fopen($jsonFile, 'r');
if (!$handle) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo leer el archivo']);
    exit;
}

while (!feof($handle)) {
    echo fgets($handle);
}

fclose($handle);
