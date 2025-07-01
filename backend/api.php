<?php

require_once 'config.php';

header('Content-Type: application/json');

// Determine the request method (GET, POST, etc.)
$method = $_SERVER['REQUEST_METHOD'];

// Get the request type from the URL parameter (e.g., ?type=destinations)
$request_type = isset($_GET['type']) ? $_GET['type'] : '';

if ($method === 'GET') {
    switch ($request_type) {
        case 'destinations':
            handle_get_request($conn, "SELECT id, name, description, image_url, price FROM destinations ORDER BY id");
            break;
        case 'bookings':
            handle_get_request($conn, "SELECT b.id, d.name as destination_name, b.name, b.email, b.travel_date, b.travelers, b.booking_date FROM bookings b JOIN destinations d ON b.destination_id = d.id ORDER BY b.booking_date DESC");
            break;
        default:
            send_error(400, 'Invalid GET request type.');
            break;
    }
} elseif ($method === 'POST') {
    switch ($request_type) {
        case 'contact':
            handle_post_contact($conn);
            break;
        case 'booking':
            handle_post_booking($conn);
            break;
        case 'cancel_booking': // <-- NEW CASE FOR CANCELLING
            handle_cancel_booking($conn);
            break;
        default:
            send_error(400, 'Invalid POST request type.');
            break;
    }
} else {
    send_error(405, 'Method Not Allowed.');
}

$conn->close();

// --- Function Definitions ---

function send_error($code, $message) {
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $message]);
}

function handle_get_request($conn, $sql) {
    $result = $conn->query($sql);
    if ($result) {
        $data = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($data);
    } else {
        send_error(500, 'Failed to fetch data from database.');
    }
}

function handle_post_contact($conn) {
    // This function remains the same
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['name'], $data['email'], $data['message'])) { return send_error(400, 'Missing required fields.'); }
    $name = trim($data['name']);
    $email = trim($data['email']);
    $message = trim($data['message']);
    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) { return send_error(400, 'Invalid input provided.'); }
    $stmt = $conn->prepare("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $message);
    if ($stmt->execute()) { http_response_code(201); echo json_encode(['status' => 'success', 'message' => 'Your message has been sent! We will get back to you soon.']); } 
    else { send_error(500, 'Failed to save your message. Please try again later.'); }
    $stmt->close();
}

function handle_post_booking($conn) {
    // This function remains the same
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['destination_id'], $data['name'], $data['email'], $data['travel_date'], $data['travelers'])) { return send_error(400, 'Missing required fields for booking.'); }
    $destination_id = (int)$data['destination_id'];
    $name = trim($data['name']);
    $email = trim($data['email']);
    $travel_date = trim($data['travel_date']);
    $travelers = (int)$data['travelers'];
    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($travel_date) || $travelers <= 0 || $destination_id <= 0) { return send_error(400, 'Invalid booking data provided.'); }
    $stmt = $conn->prepare("INSERT INTO bookings (destination_id, name, email, travel_date, travelers) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("isssi", $destination_id, $name, $email, $travel_date, $travelers);
    if ($stmt->execute()) { http_response_code(201); echo json_encode(['status' => 'success', 'message' => 'Booking confirmed! A confirmation has been sent to your email.']); } 
    else { send_error(500, 'Failed to confirm your booking. Please try again.'); }
    $stmt->close();
}

// <-- NEW FUNCTION TO HANDLE CANCELLATION -->
function handle_cancel_booking($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id']) || !is_numeric($data['id'])) {
        return send_error(400, 'Invalid booking ID provided.');
    }

    $booking_id = (int)$data['id'];

    // Use a prepared statement to prevent SQL injection
    $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $booking_id);

    if ($stmt->execute()) {
        // Check if a row was actually deleted
        if ($stmt->affected_rows > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Booking has been successfully cancelled.']);
        } else {
            send_error(404, 'Booking not found or already cancelled.');
        }
    } else {
        send_error(500, 'Failed to cancel the booking.');
    }
    
    $stmt->close();
}

?>