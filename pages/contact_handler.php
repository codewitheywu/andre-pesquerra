<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/data.php';
require_once __DIR__ . '/../includes/security.php';
sendSecurityHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Honeypot: real visitors never see or fill this field (hidden off-screen in the
// markup). A bot that fills every field gets a fake success with no DB write.
if (trim($_POST['website'] ?? '') !== '') {
    echo json_encode(['success' => true, 'message' => "Message received. I'll get back to you soon."]);
    exit;
}

$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');
$ip      = $_SERVER['REMOTE_ADDR'] ?? '';

$errors = [];
if (strlen($name)    < 2)                        $errors[] = 'Name is required.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))  $errors[] = 'Valid email is required.';
if (strlen($message) < 10)                       $errors[] = 'Message must be at least 10 characters.';

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

const MAX_INQUIRIES_PER_IP_PER_MONTH = 3;

try {
    $usedThisMonth = $ip ? countContactMessagesFromIp($ip) : 0;

    if ($ip && $usedThisMonth >= MAX_INQUIRIES_PER_IP_PER_MONTH) {
        $nextMonthName = date('F', strtotime('first day of next month'));
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => "You've reached the maximum of " . MAX_INQUIRIES_PER_IP_PER_MONTH . " inquiries for this month. Please reach out directly via email instead, or try again in $nextMonthName.",
        ]);
        exit;
    }

    if (saveContactMessage($name, $email, $subject, $message, $ip)) {
        $remaining = max(0, MAX_INQUIRIES_PER_IP_PER_MONTH - ($usedThisMonth + 1));
        echo json_encode([
            'success'   => true,
            'message'   => "Message received. I'll get back to you soon.",
            'remaining' => $remaining,
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
    }
} catch (RuntimeException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
