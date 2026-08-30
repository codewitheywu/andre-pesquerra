<?php
// ─────────────────────────────────────────────
//  CSRF protection for the CMS
// ─────────────────────────────────────────────

function csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field(): string {
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') . '">';
}

function csrf_verify(): void {
    $submitted = $_POST['csrf_token'] ?? '';
    $expected  = $_SESSION['csrf_token'] ?? '';
    if ($expected === '' || !hash_equals($expected, $submitted)) {
        http_response_code(403);
        if (function_exists('setFlash')) {
            setFlash('error', 'Security check failed — please try again.');
        }
        $back = $_SERVER['HTTP_REFERER'] ?? (defined('BASE_URL') ? BASE_URL . 'index.php' : '/');
        header('Location: ' . $back);
        exit;
    }
}
