<?php
// --- Database Credentials for AwardSpace ---
$host = 'fdb1033.awardspace.net';
$user = '4652412_travel';
$pass = 'pak12345';
$db   = '4652412_travel';

// --- Establish Database Connection ---
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");
?>
