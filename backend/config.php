<?php
// --- Database Credentials ---
// For XAMPP (default)
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'travel_db';

/*
// For AeonFree (example)
$host = 'sqlXXX.iceiy.com';
$user = 'icei_XXXXXXXX';
$pass = 'YOUR_PASSWORD';
$db   = 'icei_XXXXXXXX_travel';
*/

// --- Establish Database Connection ---
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");
?>
