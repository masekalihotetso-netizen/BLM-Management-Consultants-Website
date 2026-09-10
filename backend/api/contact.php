<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$input = json_decode(file_get_contents('php://input'), true) ?? [];
foreach (['name','phone','service','message'] as $field) {
    if (empty(trim($input[$field] ?? ''))) {
        http_response_code(400);
        echo json_encode(['message' => ucfirst($field) . ' is required.']);
        exit;
    }
}

$dir = dirname(__DIR__) . '/data';
$file = $dir . '/enquiries.json';
if (!is_dir($dir)) mkdir($dir, 0775, true);
if (!file_exists($file)) file_put_contents($file, '[]');

$data = json_decode(file_get_contents($file), true) ?: [];
$data[] = [
    'id' => round(microtime(true) * 1000),
    'name' => trim($input['name']),
    'phone' => trim($input['phone']),
    'service' => trim($input['service']),
    'message' => trim($input['message']),
    'createdAt' => date('c')
];
file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));

http_response_code(201);
echo json_encode(['message' => 'Enquiry received.']);
?>
